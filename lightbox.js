/**
 * Lightbox JavaScript - نسخة نهائية ومستقرة
 */
(function() {
    const lightboxHTML = `
    <div class="lightbox" id="lightbox">
        <button class="lightbox-close"></button>
        <div class="lightbox-counter-top">1 / 1</div>
        <div class="lightbox-content">
            <img class="lightbox-img" alt="صورة مكبرة">
        </div>
    </div>
    `;
    
    if (!document.getElementById('lightbox')) {
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxCounterTop = document.querySelector('.lightbox-counter-top');
    
    let currentImages = [];
    let currentIndex = 0;
    let isLightboxOpen = false;
    let touchStartX = 0;

    window.openLightbox = function(images, index) {
        if (!images || images.length === 0) return;
        currentImages = images;
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        isLightboxOpen = true;
        history.pushState({ lightboxOpen: true }, '');
    };
    
    function closeLightbox() {
        if (!isLightboxOpen) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        isLightboxOpen = false;
        if (history.state && history.state.lightboxOpen) {
            history.back();
        }
    }
    
    window.addEventListener('popstate', function() {
        if (isLightboxOpen) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            isLightboxOpen = false;
        }
    });

    function updateLightboxImage() {
        if (currentImages.length === 0) return;
        lightboxImg.src = currentImages[currentIndex];
        lightboxCounterTop.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    }
    
    function nextImage() {
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateLightboxImage();
    }
    
    function prevImage() {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateLightboxImage();
    }
    
    lightboxClose.addEventListener('click', closeLightbox);
    
    // التعديل هنا: الإغلاق فقط عند النقر على الخلفية (ID = lightbox)
    lightbox.addEventListener('click', (e) => {
        // نغلق فقط إذا كان الهدف هو العنصر ذو المعرف 'lightbox' (الخلفية السوداء)
        if (e.target.id === 'lightbox') {
            closeLightbox();
        }
    });
    
    lightbox.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX);
    lightbox.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) diff < 0 ? nextImage() : prevImage();
    });
    
    document.addEventListener('keydown', (e) => {
        if (!isLightboxOpen) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
    
    function bindMainImages() {
        document.querySelectorAll('.product-image img').forEach((img) => {
            img.removeEventListener('click', handleImageClick);
            img.addEventListener('click', handleImageClick);
        });
    }
    
    function handleImageClick(e) {
        e.stopPropagation();
        const productCard = e.currentTarget.closest('.product-card');
        if (!productCard) return;
        const allImages = [e.currentTarget.src];
        productCard.querySelectorAll('.product-thumb').forEach(thumb => {
            const src = thumb.getAttribute('src') || thumb.src;
            if (src && !allImages.includes(src)) allImages.push(src);
        });
        openLightbox(allImages, 0);
    }
    
    const observer = new MutationObserver(bindMainImages);
    observer.observe(document.getElementById('productsGrid') || document.body, { childList: true, subtree: true });
    bindMainImages();
})();
