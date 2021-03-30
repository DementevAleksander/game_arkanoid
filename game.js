const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    SPACE: 'Space'
};

let game = {
    running: true,
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    score: 0, //счётчик для определния уничтожения всех блоков (победа)
    rows: 10,
    cols: 8,
    width: 1280,
    height: 720,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    sounds: {
        bump: null,
    },
    initCanvasSize() {
        let realWidth = window.innerWidth * window.devicePixelRatio;
        let realHeight = window.innerHeight * window.devicePixelRatio;
        let maxHeight = this.height;
        let maxWidth = this.width;
        // всегда полностью вписываем ширину
        // значит конечная ширина - это maxWidth, тогда справедлива пропорция:
        // realWidth / realHeight
        // maxWidth / resultHeight
        // resultHeight = maxWidth * realHeight / realWidth
        // округляем вниз и отсекаем все, что выше maxWidth 
        this.height = Math.min(Math.floor(maxWidth * realHeight / realWidth), maxHeight);
        // responsive variant
        // this.height = Math.floor(maxWidth * realHeight / realWidth);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },
    init() {
        this.canvas = document.getElementById("mycanvas");
        this.ctx = this.canvas.getContext("2d"); // получаем набор методов и свойств, которые предоставляет canvas
        this.initCanvasSize();
        this.setTextFont(); //загружаем стили текста
        this.setEvents();
    },
    setTextFont() {
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#FFFFFF";
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
    preload(callback) { //загрузка ассетов перед игрой
        let loaded = 0;
        let required = Object.keys(this.sprites).length; //получаем число элементов объекта sprites
        required += Object.keys(this.sounds).length; //звук

        let onResourceLoad = () => {
            ++loaded;
            if (loaded >= required) {
                callback(); //перезапускаем функцию до тех пор, пока не отрисуются все объекты на экране
            }
        };
        this.preloadSprites(onResourceLoad); //отрисовка тегов с блоками
        this.preloadAudio(onResourceLoad); //отрисовка тэга с музыкой
    },
    preloadSprites(onResourceLoad) {
        for (let key in this.sprites) {
            this.sprites[key] = new Image(); //создаём новый тэг img
            this.sprites[key].src = "img/" + key + ".png";
            this.sprites[key].addEventListener("load", onResourceLoad);
        }
    },
    preloadAudio(onResourceLoad) {
        for (let key in this.sounds) {
            this.sounds[key] = new Audio("sounds/" + key + ".mp3");
            this.sounds[key].addEventListener("canplaythrough", onResourceLoad, {once: true});
        }
    },
    create() {
        this.ball.x = this.width / 2 - 20;
        this.ball.y = this.height - 85;
        this.platform.x = this.width / 2 - 125;
        this.platform.y = this.height - 45;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({ //отрисовка блоков
                    active: true,
                    width: 111,
                    height: 39,
                    x: 113 * col + 180,
                    y: 42 * row + 90 
                });
            }
        }
    },
    update() {
        // console.log("Вызов метода update() каждый кадр!")
        this.collideBlocks();
        this.collidePlatform();
        this.ball.collideWorldBounds();
        this.platform.collideWorldBounds();
        this.platform.move();
        this.ball.move();
    },
    addScore() {
        ++this.score;

        if (this.score >= this.blocks.length) {
            this.end("Вы победили !!!!    :)");
        }
    },
    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active && this.ball.collide(block)) { //проверка на прикосновение с объектом
                this.ball.bumpBlock(block); //меняем направление мяча, отскок, прис условии, что блок активен
                this.addScore(); //счётчик сбитых блоков
                this.sounds.bump.play(); //звук столкновения
            }
        }
    },
    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform); //отскок мяча от платформы
            this.sounds.bump.play(); //звук столкновения
        }
    },
    run() {
        if (this.running) {
            window.requestAnimationFrame(() => { //отвечает за отрисовку
                this.update();
                this.render();
                this.run(); //рукурсия. Зациклим. обновляем координаты объектов, то есть браузер постоянно будет выводить объекты с актуальными координатами.
            });
        }
    },
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height); //очищаем предыдущий кадр
        this.ctx.drawImage(this.sprites.background, 0, 0); //планируем вывести картинку на экран (картинка, x, y) - выводим картинку с верхнего левого угла
        this.ctx.drawImage(this.sprites.ball, this.ball.frame * this.ball.width, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height); //смещение относитьельно картинки
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
        this.ctx.fillText("Блоки: " + this.score, 70, 46); //выводим текст на экран
    },
    renderBlocks() {
        for (let block of this.blocks) {
            if (block.active) {
                this.ctx.drawImage(this.sprites.block, block.x, block.y);
            }
        }
    },
    start: function() {
        this.init();
        this.preload(() => { //после загрузки всех изображений запускаем метод run()
            this.create();
            this.run();
        });
    },
    end(message) {
        this.running = false;
        alert(message);
        window.location.reload();
    },
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};

game.ball = {
    dx: 0,
    dy: 0,
    frame: 0, //анимация мяча
    velocity: 7,
    x: game.width / 2 - 20,
    y: game.height - 85,
    width: 40,
    height: 40,
    start() {
        this.dy = -this.velocity;
        this.dx = game.random(-this.velocity, this.velocity); //случайный угол
        // this.animate(); //анимация мяча
    },
    animate() {
        setInterval(() => {
            ++this.frame;
            if (this.frame > 3) {
                this.frame = 0;
            }
        }, 100);
    },
    move() {
        if (this.dy) {
            this.y += this.dy;
        }
        if (this.dx) {
            this.x += this.dx;
        }
    },
    collide(element) {
        let x = this.x + this.dx; //исправляем баг с застреванием мяча между блоками
        let y = this.y + this.dy;

        if (x + this.width > element.x &&
            x  < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height) {
                return true;
            } //проверяем соприкосновение мяча с блоком по координатам
        return false;
    },
    collideWorldBounds() { //отталкиваемся от краёв экрана
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        let ballLeft = x;
        let ballRight = ballLeft + this.width;
        let ballTop = y;
        let ballBottom = ballTop + this.height;

        let worldLeft = 0;
        let worldRight = game.width;
        let worldTop = 0;
        let worldBottom = game.height;

        if (ballLeft < worldLeft) { //если координата x левой стороны мяча меньше коррдинаты x левого края экрана
            this.x = 0;
            this.dx = this.velocity;
            game.sounds.bump.play();
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width;
            this.dx = -this.velocity;
            game.sounds.bump.play();
        } else if (ballTop < worldTop) {
            this.y = 0;
            this.dy = this.velocity;
            game.sounds.bump.play();
        } else if (ballBottom > worldBottom) {
            game.end("Вы проиграли....    :(");
        }
    },
    bumpBlock(block) {
        this.dy *= -1; //меняем направление мяча на противоположное
        block.active = false; //не отрисовываем блок (уничтожаем)
    },
    bumpPlatform(platform) {
        if (platform.dx) {
            this.x += platform.dx;
        }

        if (this.dy > 0) { //когда мяч оттолкнулся
            this.dy = -this.velocity; //отталкиваемся от платформы только вверх
            let touchX = this.x + this.width / 2;  //координата касания
            this.dx = this.velocity * platform.getTouchOffset(touchX); //изменение направления мяча, в зависимости от того, на какую часть платформы он упал. возвращает значение от -1 до 1.
        }
    }
};

game.platform = {
    velocity: 15, //будет отвечать за скорость движения платформы
    dx: 0, // смещение по оси x (с какой скоростью движется платформа) в данный момент
    x: game.width / 2 - 125,
    y: game.height - 45,
    width: 251,
    height: 41,
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
    },
    getTouchOffset(x) { //логика отскока мяча от платформы.
        let diff = (this.x + this.width) - x;
        let offset = this.width - diff;
        let result = 2 * offset / this.width;
        return result - 1;
    },
    collideWorldBounds() { //Запрещаем платформе выйти за края экрана
        let x = this.x + this.dx;
        let platformLeft = x;
        let platformRight = platformLeft + this.width;
        let worldLeft = 0;
        let worldRight = game.width;

        if (platformLeft < worldLeft || platformRight > worldRight) {
            this.dx = 0;
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

