// Monkey succesions

const w = 1024, h = 768;

class Nivel
{
    constructor (sucesion, opciones, fondo)
    {
        this.sucesion = sucesion;   // sucesión de 6 números. El número faltante está dado por un -1
        this.opciones = opciones;   // 4 opciones a escoger. El primer elemento debe ser la respuesta de la sucesión
        this.fondo = fondo;         // imagen de fondo del nivel
    }
}

var niveles = [
    new Nivel([4, 14, 24, -1, 44, 54], [34, 40, 29, 64], 'fondo1'),
    new Nivel([17, 14, -1, 8, 5, 2], [11, 7, 20, 15], 'fondo5'),
    new Nivel([1, 4, 1, 6, -1, 8], [1, 5, 7, 10], 'fondo3'),
    new Nivel([3, 6, 9, -1, 15, 18], [12, 10, 13, 8], 'fondo2'),
    new Nivel([2, 4, 7, 9, 13, -1, 20], [15, 10, 17, 14], 'fondo4'),
    new Nivel([1, 2, 3, 5, -1, 13], [8, 10, 15, 7], 'fondo6'),
    new Nivel([5, 10, 15,-1, 25, 30], [20, 17, 15, 35], 'fondo7'),
    new Nivel([1, 2, 4, 8, -1, 32], [16, 10, 15, 20], 'fondo8')
];

const shuffle = array => {
    let currentIndex = array.length, randomIndex;
    var out = [...array];
  
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [out[currentIndex], out[randomIndex]] = [out[randomIndex], out[currentIndex]];
    }
    return out;
};

const choice = a => a[Math.floor(Math.random()*a.length)];

class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('boot');
    }

    preload ()
    {
        this.load.setPath('assets/');
        this.load.image('barandal', 'barandal.png');
        this.load.image('botonJugar', 'botonJugar.PNG');
        this.load.image('fondo1', 'fondo1.jpg');
        this.load.image('fondo2', 'fondo2.jpg');
        this.load.image('fondo3', 'fondo3.jpg');
        this.load.image('fondo4', 'fondo4.jpg');
        this.load.image('fondo5', 'fondo5.jpg');
        this.load.image('fondo6', 'fondo6.jpg');
        this.load.image('fondo7', 'fondo7.jpg');
        this.load.image('fondo8', 'fondo8.jpg');
        this.load.image('lava', 'lava.jpg');
        this.load.image('madera', 'madera.jpg');
        this.load.image('madera1', 'madera1.png');
        this.load.image('piedra', 'piedra.png');
        this.load.image('planta', 'planta.png');
        this.load.image('regresar', 'regresar.png');
        this.load.image('banana', 'banana.png');
        this.load.image('logo', 'logo.png');
        this.load.image('yellow', 'yellow.png');
        this.load.audio('music_bg', 'sounds/music_bg.mp3');
        this.load.audio('happyMusic', 'sounds/happyMusic.mp3');

        this.load.setPath('assets/animations/');
        this.load.image('monkey_idle', 'monkey_idle.png');
        this.load.image('monkey_faceforward', 'monkey_faceforward.png');
        this.load.image('monkey_armsup', 'monkey_armsup.png');
        this.load.image('monkey_dead', 'monkey_dead.png');
        this.load.spritesheet('monkey_walk', 'monkey_walk.png', {frameWidth: 140, frameHeight: 168});

        var p = this.add.text(w/2, h/2, 'Cargando... 0%', {fontSize: 30}).setOrigin(0.5, 0.5);
        this.load.on('progress', value => p.setText(`Cargando... ${Math.floor(value*100)}%`));
        this.load.on('complete', () => this.scene.start('menu'));
    }
}

var music_bg = 0;

class Menu extends Phaser.Scene
{
    constructor ()
    {
        super('menu');
    }

    create ()
    {
        this.input.setDefaultCursor('url(assets/monkeCursor.cur), pointer');
        this.sound.pauseOnBlur = false;

        if(!music_bg) { music_bg = this.sound.add('music_bg', {loop: true}).play() }

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('monkey_walk'),
            frameRate: 6,
            repeat: -1
        });

        this.bg = this.add.tileSprite(w/2, h/2, 0, 0, 'fondo1');
        this.home();
    }

    home ()
    {
        var logo = this.add.image(w/2,200,'logo').setScale(0.4);
        var boton = this.add.image(w/2,550,'botonJugar')
        .setScale(0.6)
        .setInteractive()
        .on('pointerover', () => boton.setScale(0.65))
        .on('pointerout', () => boton.setScale(0.6))
        .once('pointerdown', () => {
            [logo,boton].forEach(k => k.destroy());
            this.instrucciones();
        });

        this.tweens.add({
            targets: logo,
            scale: 0.44,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Power2'
        });
    }

    instrucciones ()
    {
        var rec = this.add.graphics().fillRect(0,0,w,h).setAlpha(0.4);
        var monke = this.add.image(90, 650, 'monkey_faceforward');

        var titulo = this.add.text(w/2, 80, 'Cómo jugar', {fontSize: 38, fontFamily: 'CooperBlack', align: 'center', stroke: '#000000', strokeThickness: 5})
        .setOrigin(0.5,0.5)

        var txt = this.add.text(w/2, h/2, `Ayuda a Titi el Mono a cruzar el puente\ncompletando la serie numérica para conseguir\nplátanos. ¡Consigue ${niveles.length} plátanos\npara ganar! ¡Buena suerte!`, {fontSize: 38, fontFamily: 'CooperBlack', align: 'center', stroke: '#000000', strokeThickness: 5})
        .setOrigin(0.5,0.5)
        .setLineSpacing(20)
        .setInteractive()
        .once('pointerdown', () => {
            niveles = shuffle([...niveles]);
            this.scene.start('juego', niveles[0]);
        });

        var boton = this.add.image(110,80,'regresar')
        .setScale(0.045)
        .setInteractive()
        .once('pointerdown', () => {
            [monke,rec,txt,boton,titulo].forEach(k => k.destroy());
            this.home();
        });
    }

    update ()
    {
        this.bg.tilePositionX += 1;
    }
}

class Juego extends Phaser.Scene
{
    constructor ()
    {
        super('juego');
        this.offY = 140;
    }

    init (data)
    {
        this.nivel = niveles.indexOf(data)+1;
        this.sucesion = data.sucesion;
        this.opciones = data.opciones;
        this.respuesta = this.opciones[0];
        this.missing = this.sucesion.indexOf(-1)+1;
        this.fondo = data.fondo;

        this.frases = [
            '¡Lo lograste!',
            '¡Sigue así!',
            '¡Eres un experto!'
        ];
        this.perder = '¡Oh no!, recuerda\nque el número\nfaltante debe seguir\nun patrón o regla.\n¡Tu puedes!';
    }

    create ()
    {
        this.bg = this.add.image(w/2, h/2, this.fondo);
        this.add.image(200, h/2-80+this.offY, 'barandal').setScale(0.46);
        this.add.image(598, h/2-80+this.offY, 'barandal').setScale(0.46);
        this.add.image(988, h/2-80+this.offY, 'barandal').setScale(0.46);

        this.add.image(110,80,'regresar')
        .setScale(0.045)
        .setInteractive()
        .on('pointerdown', () => this.scene.start('menu'));

        this.add.text(w/2, 80, `SUCESIÓN ${this.nivel}`, {fontFamily: 'CooperBlack', fontSize: 38, stroke: '#000000', strokeThickness: 6}).setOrigin(0.5,0.5);
        this.add.text(118, 725, 'Plátanos: ', {fontFamily: 'CooperBlack', fontSize: 38, stroke: '#000000', strokeThickness: 6}).setOrigin(0.5,0.5);

        this.add.image(78, h/2+this.offY, 'madera').setScale(0.5);
        for (var i = 1; i <= 6; i++){
            if (this.sucesion[i-1] != -1) { 
                this.add.image(78+i*146, h/2+this.offY, 'madera').setScale(0.5);
                this.add.text(78+i*146, h/2+this.offY, this.sucesion[i-1]+[], {fontFamily: 'CooperBlack', fontSize: 38, stroke: '#000000', strokeThickness: 6}).setOrigin(0.5,0.5);
            }
        }

        var botones = [];
        var opciones = shuffle(this.opciones);

        for(var i = 0; i < 4; i++){
            var bt = this.add.image(0, 0, 'madera').setScale(0.5);
            var txt = this.add.text(0, 0, opciones[i]+[], {fontFamily: 'CooperBlack', fontSize: 38, stroke: '#000000', strokeThickness: 6}).setOrigin(0.5,0.5);
            var contain = this.add.container(208+i*210, -60, [bt, txt]).setSize(bt.width/2, bt.height/2).setData('valor', opciones[i]);

            botones.push(contain);
        }

        this.monke = this.add.sprite(-50, h/2+this.offY-60, 'monkey_idle');
        this.interactive = botones;

        for (var i = 1; i <= this.nivel-1; i++)
            this.add.image(165 + i*55, 725, 'banana').setScale(0.045);

        this.tweens.add({
            targets: botones,
            y: h/2-140,
            ease: 'Bounce',
            duration: 900,
            delay: 200,
            onComplete: () => this.monke.play('walk')
        });

        this.tweens.add({
            targets: this.monke,
            x: 90,
            ease: 'Linear',
            delay: 1100,
            duration: 2000,
            onComplete: () => {
                this.monke.destroy();
                this.monke = this.add.sprite(90, h/2+this.offY-60, 'monkey_idle');
                this.enableInputs();
            }
        })
    }

    enableInputs ()
    {
        for (const step of this.interactive) {
            step.setInteractive()
            .on('pointerover', () => step.setScale(1.15))
            .on('pointerout', () => step.setScale(1))
            .on('pointerdown', () => this.moveMonkey(step));
        }
    }

    disableInputs ()
    {
        for (const item of this.interactive) item.disableInteractive()
    }

    moveMonkey (step)
    {
        this.disableInputs();
        step.setScale(1);
        this.monke.play('walk');

        this.tweens.add({
            targets: step,
            x: 78 + 146*this.missing,
            y: h/2+this.offY,
            duration: 900,
            ease: 'Back'
        });

        this.tweens.add({
            targets: this.monke,
            x: step.getData('valor') == this.respuesta? 954 : 78 + 146*this.missing,
            ease: 'Linear',
            duration: 4000,
            onComplete: () => {
                this.monke.destroy();
                if (step.getData('valor') == this.respuesta)
                    this.winLevel();
                else
                    this.loseLevel(step);
            }
        });
    }

    winLevel ()
    {
        this.add.image(954, h/2+this.offY-60, 'monkey_armsup');
        this.sound.add('happyMusic').play({volume: 0.4});

        var cnt = this.add.image(0, 0, 'madera1').setScale(0.25);
        var txt = this.add.text(0, 0, choice(this.frases)+"\nTe ganaste un plátano :)", {fontSize: 38, fontFamily: 'CooperBlack', align: 'center', stroke: '#000000', strokeThickness: 5}).setOrigin(0.5,0.5);
        var cont = this.add.container(w/2, h/2, [cnt, txt]).setScale(0);

        var particles = this.add.particles('yellow');
        var banana = this.add.image(w/2, 500, 'banana').setScale(0);

        this.tweens.add({
            targets: [...this.interactive].filter(s => s.getData('valor') != this.respuesta),
            scale: 0,
            ease: 'Linear'
        });

        var i = 1500;

        this.tweens.add({
            targets: cont,
            scale: 1,
            angle: 720,
            ease: 'Sine.easeOut',
            duration: i
        });

        this.tweens.add({
            targets: banana,
            scale: 0.045,  
            ease: 'Elastic',
            duration: 1000,
            delay: i+100,
            onStart: () => particles.createEmitter({
                speed: 100,
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD'
            }).startFollow(banana)
        });

        i += 1000;

        this.tweens.add({
            targets: banana,
            x: 165 + 55*this.nivel,
            y: 725,
            ease: 'Sine.easeOut',
            duration: 700,
            delay: i+100,
            onComplete: () => this.input.once('pointerdown', () =>{
                    if (this.nivel != niveles.length)
                        this.scene.start('juego', niveles[this.nivel]);
                    else
                        this.scene.start('end');
                })
        });
    }

    loseLevel (step)
    {
        var monke = this.add.image(78 + 146*this.missing, h/2+this.offY-60, 'monkey_dead');

        var cnt = this.add.image(-10, -20, 'piedra').setScale(0.3);
        var txt = this.add.text(0, 10, this.perder, {fontSize: 38, fontFamily: 'CooperBlack', align: 'center', stroke: '#000000', strokeThickness: 5}).setOrigin(0.5,0.5);
        var cont = this.add.container(w/2, h/2, [cnt, txt]).setScale(0);

        this.tweens.add({
            targets: step,
            y: 870,
            ease: 'Power2'
        });
        this.tweens.add({
            targets: monke,
            y: h/2+this.offY-140,
            duration: 250,
            ease: 'Sine.easeOut'
        });
        this.tweens.add({
            targets: monke,
            y: 870,
            delay: 250,
            duration: 600,
            ease: 'Sine.easeIn',
        });
        this.tweens.add({
            targets: cont,
            scale: 1,
            ease: 'Back',
            delay: 950,
            onComplete: () => this.input.once('pointerdown', () => this.scene.start('juego', niveles[this.nivel-1]))
        });
    }
}

class End extends Phaser.Scene
{
    constructor ()
    {
        super('end');
    }

    create ()
    {
        this.bg = this.add.tileSprite(w/2, h/2, 0, 0, 'fondo1');
        this.add.text(w/2, 80, "¡¡Felicidades!! \nEres un experto de las sucesiones", {fontSize: 38, fontFamily: 'CooperBlack', align: 'center', stroke: '#000000', strokeThickness: 5}).setOrigin(0.5,0.5);
        this.add.image(w/2, h/2, 'monkey_armsup')
        this.input.once('pointerdown', () => this.scene.start('menu'));
    }

    update ()
    {
        this.bg.tilePositionX += 1;
    }
}

const config = {
    type: Phaser.CANVAS,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: w,
        height: h
    },
    physics: {
        default: 'arcade'
    },
    scene: [Boot, Menu, Juego, End],
    title: 'Monkey succesions!',
    url: 'https://cool-monke-game.glitch.me/'
}

document.fonts.load('10pt CooperBlack').then(() => new Phaser.Game(config));