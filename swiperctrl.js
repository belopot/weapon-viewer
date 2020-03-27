var swiper = document.getElementById("swiper-root")
swiper.innerHTML = "";


var data = [
    { name: "AKM", thumbnail: "assets/thumbnails/akm.jpg", model: "/assets/models/akm/scene.gltf" },
    { name: "DSHK", thumbnail: "assets/thumbnails/dshk.jpg", model: "/assets/models/dshk/scene.gltf" },
    { name: "FAL", thumbnail: "assets/thumbnails/fal.jpg", model: "/assets/models/fal/scene.gltf" },
    { name: "GALIL", thumbnail: "assets/thumbnails/galil.jpg", model: "/assets/models/galil/scene.gltf" },
    { name: "HK21", thumbnail: "assets/thumbnails/hk21.jpg", model: "/assets/models/hk21/scene.gltf" },
    { name: "LG5", thumbnail: "assets/thumbnails/lg5.jpg", model: "/assets/models/lg5/scene.gltf" },
    { name: "Multi Rocket Launcher", thumbnail: "assets/thumbnails/multi_rocket_launcher.jpg", model: "/assets/models/multi_rocket_launcher/scene.gltf" },
    { name: "NORINCO", thumbnail: "assets/thumbnails/norinco.jpg", model: "/assets/models/norinco/scene.gltf" },
    { name: "PKM", thumbnail: "assets/thumbnails/pkm.jpg", model: "/assets/models/pkm/scene.gltf" },
    { name: "QBZ", thumbnail: "assets/thumbnails/qbz.jpg", model: "/assets/models/qbz/scene.gltf" },
    { name: "QLZ", thumbnail: "assets/thumbnails/qlz.jpg", model: "/assets/models/qlz/scene.gltf" },
    { name: "RECOILLESS", thumbnail: "assets/thumbnails/recoilless.jpg", model: "/assets/models/recoilless/scene.gltf" },
    { name: "RPG", thumbnail: "assets/thumbnails/rpg.jpg", model: "/assets/models/rpg/scene.gltf" },
    { name: "SMG", thumbnail: "assets/thumbnails/smg.jpg", model: "/assets/models/smg/scene.gltf" },
    { name: "SPG", thumbnail: "assets/thumbnails/spg.jpg", model: "/assets/models/spg/scene.gltf" },
    { name: "SVD", thumbnail: "assets/thumbnails/svd.jpg", model: "/assets/models/svd/scene.gltf" },
    { name: "AKM56", thumbnail: "assets/thumbnails/type56.jpg", model: "/assets/models/type56/scene.gltf" }
]

for (var i = 0; i < data.length; i++) {
    var slide = document.createElement("div");
    slide.classList.add("swiper-slide", "tooltip")
    slide.style.backgroundImage = `url(./` + data[i].thumbnail + `)`;

    slide.modelURL = data[i].model;

    slide.addEventListener('click', function(event){
        window.mainScene.loadGLTF(this.modelURL);
    })

    //Tooltip
    var tooltip = document.createElement("span");
    tooltip.classList.add("tooltiptext");
    tooltip.innerText = data[i].name;

    slide.appendChild(tooltip);

    swiper.appendChild(slide);

}

var galleryThumbs = new Swiper('.gallery-thumbs', {
    spaceBetween: 5,
    slidesPerView: window.innerWidth / (80 * 3),
    freeMode: true,
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
});


