const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    SPACE: 'Space'
};

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
        this.setEvents();
    },
    setEvents() {
        window.addEventListener("keydown", e => {
            // console.log(e)
            // console.log(e.key === KEYS.SPACE)
            if (e.code == KEYS.SPACE) {
                // console.log(KEYS.SPACE)
                this.platform.fire(); //платформа запускает мяч
            } else if (e.code == KEYS.LEFT || e.code === KEYS.RIGHT) {
                this.platform.start(e.key);
            }
        });
        window.addEventListener("keyup", e => { //устанавливаем движение в 0 (останавливаем платформу)
            this.platform.stop();
        });
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
    update() {
        // console.log("Вызов метода update() каждый кадр!")
        this.platform.move();
        this.ball.move();
    },
    run() {
        window.requestAnimationFrame(() => { //отвечает за отрисовку
            this.update();
            this.render();
            this.run(); //рукурсия. Зациклим. обновляем координаты объектов, то есть браузер постоянно будет выводить объекты с актуальными координатами.
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
    dy: 0,
    velocity: 3,
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    start() {
        this.dy = -this.velocity;
    },
    move() {
        if (this.dy) {
            this.y += this.dy;
        }
    }
};

game.platform = {
    velocity: 6, //будет отвечать за скорость движения платформы
    dx: 0, // смещение по оси x (с какой скоростью движется платформа) в данный момент
    x: 280,
    y: 300,
    ball: game.ball, //получаем объект мяча, чтобы дальше работать с ним внутри объекта платформы, чтобы мяч при взлёте не следовал за платформой.
    fire() {
        if (this.ball) {
            this.ball.start(); //запускаем мяч только пока он на платформе
            this.ball = null;
        }
    },
    start(direction) {
        if (direction === KEYS.LEFT) {
            this.dx = -this.velocity;
        } else if (direction === KEYS.RIGHT) {
            this.dx = this.velocity;
        }
    },
    stop() {
        this.dx = 0;
    },
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball) {
                this.ball.x += this.dx; //изменяем координаты мяча, пока он на платформе
            }
        }
    }
};

window.addEventListener("load", () => {
    game.start();
});

// Последовательность запусков функций:
// 1. start() - запуск функций по порядку ниже.
// 2. init() - получаем доступ к работе с canvas.
// 3. setEvents() - определяем кнопки управления игрой. Заупуск каждый раз, когда происходит событие нажатия на клавиатуре.
// 4. create() - создание массива с блоками для сбивания.
// 5. run() - запускает функции 6. update(); 7. render(); 8. run();
// 6. update() - отвечает за обновление кординат перемещения спрайтов.
// 7. render() - обозначаем, что мы планируем отрисовать на экране.
// 8. run() - заново запускаем, чтобы обновились функции 6. update(); 7. render(); 8. run(); для того, чтобы обновлялись координаты объектов (перерисовка изображений, с учётом новых координат).
// 9. preload() - вывод всех запланированных в render() спрайтов на экран.

