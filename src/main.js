import Phaser from 'phaser'

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.blocks = []
    this.currentBlock = null
    this.score = 0
    this.highScore = 0
    this.combo = 0
    this.swingAngle = 0
    this.swingSpeed = 0.025
    this.gameEnded = false
    this.clouds = []
  }

  create() {
    this.cameras.main.setBackgroundColor('#c7d5f7')

    this.highScore = Number(localStorage.getItem('cityblocks-highscore') || 0)

    for (let i = 0; i < 16; i++) {
      const h = Phaser.Math.Between(180, 520)

      this.add.rectangle(i * 28, 720 - h / 2, Phaser.Math.Between(25, 60), h, 0x6c7a99, 0.2)
    }

    for (let i = 0; i < 5; i++) {
      const cloud = this.add.ellipse(
        Phaser.Math.Between(0, 400),
        Phaser.Math.Between(60, 220),
        Phaser.Math.Between(70, 120),
        35,
        0xffffff,
        0.8
      )

      cloud.speed = Phaser.Math.FloatBetween(0.1, 0.4)
      this.clouds.push(cloud)
    }

    this.add.line(0,0,200,0,200,120,0x444444).setLineWidth(6)
    this.add.line(0,0,120,120,280,120,0x444444).setLineWidth(6)

    this.scoreText = this.add.text(18, 14, '0', {
      fontSize: '32px',
      color: '#ffe66d',
      fontStyle: 'bold'
    }).setScrollFactor(0)

    this.highScoreText = this.add.text(18, 50, `BEST ${this.highScore}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setScrollFactor(0)

    this.comboText = this.add.text(18, 76, '', {
      fontSize: '16px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setScrollFactor(0)

    const base = this.createBlock(200, 640, 170)
    this.blocks.push(base)

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    this.input.on('pointerdown', () => {
      if (this.gameEnded) {
        this.scene.restart()
      } else {
        this.dropBlock()
      }
    })

    this.spawnBlock()
  }

  createBlock(x, y, width) {
    const container = this.add.container(x, y)

    const outer = this.add.rectangle(0, 0, width, 48, 0xc98b2e)
    outer.setStrokeStyle(4, 0x6b4b16)

    const inner = this.add.rectangle(0, 0, width - 8, 40, 0xe0a33b)

    container.add(outer)
    container.add(inner)

    const cols = Math.max(2, Math.floor(width / 34))

    for (let i = 0; i < cols; i++) {
      const wx = -width / 2 + 20 + i * 30

      const win = this.add.rectangle(wx, 0, 18, 22, 0x2c3e50)
      const glow = this.add.rectangle(wx, 0, 12, 16, 0x74b9ff)

      container.add(win)
      container.add(glow)
    }

    container.blockWidth = width

    return container
  }

  spawnBlock() {
    const last = this.blocks[this.blocks.length - 1]

    this.currentBlock = this.createBlock(200, last.y - 56, last.blockWidth)

    this.craneLine = this.add.line(
      0,
      0,
      200,
      120,
      this.currentBlock.x,
      this.currentBlock.y - 8,
      0x333333
    ).setLineWidth(3)
  }

  createImpactParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const particle = this.add.circle(x, y, 3, 0xffffff)

      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-40, 40),
        y: y + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      })
    }
  }

  dropBlock() {
    if (!this.currentBlock || this.gameEnded) return

    const last = this.blocks[this.blocks.length - 1]
    const delta = Math.abs(this.currentBlock.x - last.x)

    if (delta > last.blockWidth / 2) {
      this.endGame()
      return
    }

    const overlap = last.blockWidth - delta

    if (delta < 4) {
      this.combo += 1
      this.comboText.setText(`COMBO x${this.combo}`)
    } else {
      this.combo = 0
      this.comboText.setText('')
    }

    this.createImpactParticles(this.currentBlock.x, this.currentBlock.y)

    this.currentBlock.blockWidth = overlap
    this.currentBlock.x = Phaser.Math.Linear(this.currentBlock.x, last.x, 0.5)

    this.currentBlock.list[0].width = overlap
    this.currentBlock.list[1].width = overlap - 8

    this.blocks.push(this.currentBlock)

    this.score += 1 + this.combo
    this.scoreText.setText(this.score)

    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('cityblocks-highscore', this.highScore)
      this.highScoreText.setText(`BEST ${this.highScore}`)
    }

    this.swingSpeed += 0.0007

    this.craneLine.destroy()

    this.cameras.main.shake(90, 0.004)

    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.cameras.main.scrollY - 56,
      duration: 200
    })

    this.spawnBlock()
  }

  endGame() {
    this.gameEnded = true

    this.add.rectangle(200, 320, 260, 120, 0x000000, 0.7).setScrollFactor(0)

    this.add.text(80, 295, 'GAME OVER', {
      fontSize: '34px',
      color: '#ff6b6b',
      fontStyle: 'bold'
    }).setScrollFactor(0)
  }

  update() {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed

      if (cloud.x > 470) {
        cloud.x = -80
      }
    }

    if (this.gameEnded) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart()
      }

      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.dropBlock()
    }

    if (!this.currentBlock) return

    this.swingAngle += this.swingSpeed

    this.currentBlock.x = 200 + Math.sin(this.swingAngle) * 120
    this.currentBlock.rotation = Math.sin(this.swingAngle) * 0.15

    this.craneLine.setTo(200,120,this.currentBlock.x,this.currentBlock.y - 8)
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 400,
  height: 700,
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
})