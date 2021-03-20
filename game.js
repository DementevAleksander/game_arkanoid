let game = {
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    init: function() {
        this.ctx = document.getElementById("mycanvas").getContext("2d"); // получаем набор методов и свойств, которые предоставляет canvas
    },
    preload(callback) {
        let loaded = 0;
        let required = Object.keys(this.sprites).length; //получаем число элементов объекта sprites
        let onImageLoad = () => {
            ++loaded;
            if (loaded >= required) {
                callback(); //перезапускаем функцию до тех пор, пока не отрисуются все объекты на экране
            }
        };

        for (let key in this.sprites) {
            this.sprites[key] = new Image(); //создаём новый тэг img
            this.sprites[key].src = "img/" + key + ".png";
            this.sprites[key].addEventListener("load", onImageLoad);
        }
    },
    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    x: 64 * col + 65,
                    y: 24 * row + 35 
                });
            }
        }
    },
    run() {
        window.requestAnimationFrame(() => { //отвечает за отрисовку
            this.render();
        });
    },
    render() {
        this.ctx.drawImage(this.sprites.background, 0, 0); //планируем вывести картинку на экран (картинка, x, y) - выводим картинку с верхнего левого угла
        this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height); //смещение относитьельно картинки
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
    },
    renderBlocks() {
        for (let block of this.blocks) {
            this.ctx.drawImage(this.sprites.block, block.x, block.y);
        }
    },
    start: function() {
        this.init();
        this.preload(() => { //после загрузки всех изображений запускаем метод run()
            this.create();
            this.run();
        });
    }
};

game.ball = {
    x: 320,
    y: 280,
    width: 20,
    height: 20
};

game.platform = {
    x: 280,
    y: 300
};

window.addEventListener("load", () => {
    game.start();
});
