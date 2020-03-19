var swiper = document.getElementById("swiper-root")
swiper.innerHTML = "";


var data = [
    { name: "AKM", thumbnail: "assets/thumbnails/akm.jpg", model: "assets/models/akm/scene.gltf" },
    { name: "FAL", thumbnail: "assets/thumbnails/fal.jpg", model: "assets/models/fal/scene.gltf" },
    { name: "DSHK", thumbnail: "assets/thumbnails/dshk.jpg", model: "assets/models/dshk/scene.gltf" },
    { name: "GALIL", thumbnail: "assets/thumbnails/galil.jpg", model: "assets/models/galil/scene.gltf" }
]

for (var i = 0; i < data.length; i++) {
    var slide = document.createElement("div");
    slide.classList.add("swiper-slide")
    slide.style.backgroundImage = `url(./` + data[i].thumbnail + `)`;

    slide.modelURL = data[i].model;

    slide.addEventListener('click', function(event){
        window.mainScene.loadGLTF(this.modelURL);
    })

    swiper.appendChild(slide);

}

var galleryThumbs = new Swiper('.gallery-thumbs', {
    spaceBetween: 5,
    slidesPerView: window.innerWidth / (80 * 3),
    freeMode: true,
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
});


