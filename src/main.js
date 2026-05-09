import Phaser from 'phaser'

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.blocks = []
    this.currentBlock = null
    this.direction = 1
    this.score = 0
    this.speed = 2.8
    this.gameEnded = false
  }

  create() {
    this.createBackground()

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setScrollFactor(0)

    this.highScore = Number(localStorage.getItem('cityblocks-highscore') || 0)

    this.highScoreText = this.add.text(20, 55, `High Score: ${this.highScore}`, {
      fontSize: '18px',
      color: '#ecf0f1'
    }).setScrollFactor(0)

    const base = this.createBuildingBlock(200, 620, 180)
    this.blocks.push(base)

    this.spawnBlock()

    this.input.on('pointerdown', () => {
      if (this.gameEnded) {
        this.scene.restart()
        return
      }

      this.dropBlock()
    })
  }

  createBackground() {
    this.cameras.main.setBackgroundColor('#7ed6df')

    for (let i = 0; i < 10; i++) {
      const width = Phaser.Math.Between(40, 90)
      const height = Phaser.Math.Between(200, 500)
      const x = i * 55
      const y = 700 - height / 2

      this.add.rectangle(x, y, width, height, 0x95a5a6, 0.25)
    }
  }

  createBuildingBlock(x, y, width) {
    const container = this.add.container(x, y)

    const body = this.add.rectangle(0, 0, width, 42, 0xe67e22)
    body.setStrokeStyle(3, 0x2d3436)

    container.add(body)

    const windowCount = Math.max(2, Math.floor(width / 35))

    for (let i = 0; i < windowCount; i++) {
      const windowX = -width / 2 + 20 + i * 30

      const win = this.add.rectangle(windowX, 0, 16, 16, 0x2c3e50)
      container.add(win)
    }

    container.blockWidth = width

    return container
  }

  spawnBlock() {
    const lastBlock = this.blocks[this.blocks.length - 1]

    this.currentBlock = this.createBuildingBlock(
      80,
      lastBlock.y - 52,
      lastBlock.blockWidth
    )

    this.craneLine = this.add.line(
      0,
      0,
      this.currentBlock.x,
      this.currentBlock.y - 260,
      this.currentBlock.x,
      this.currentBlock.y,
      0x2d3436
    ).setLineWidth(2)

    this.isDropping = false
  }

  dropBlock() {
    if (this.isDropping || !this.currentBlock || this.gameEnded) return

    this.isDropping = true

    const lastBlock = this.blocks[this.blocks.length - 1]

    const delta = Math.abs(this.currentBlock.x - lastBlock.x)

    if (delta > lastBlock.blockWidth / 2) {
      this.endGame()
      return
    }

    const overlap = lastBlock.blockWidth - delta

    const cutWidth = this.currentBlock.blockWidth - overlap

    if (cutWidth > 5) {
      const cutPiece = this.add.rectangle(
        this.currentBlock.x > lastBlock.x
          ? this.currentBlock.x + overlap / 2
          : this.currentBlock.x - overlap / 2,
        this.currentBlock.y,
        cutWidth,
        42,
        0xd35400
      )

      cutPiece.setStrokeStyle(2, 0x2d3436)

      this.tweens.add({
        targets: cutPiece,
        y: cutPiece.y + 700,
        angle: 90,
        duration: 1200,
        ease: 'Cubic.easeIn',
        onComplete: () => cutPiece.destroy()
      })
    }

    const perfect = delta < 4

    if (perfect) {
      this.score += 2

      const perfectText = this.add.text(
        this.currentBlock.x - 35,
        this.currentBlock.y - 50,
        'PERFECT!',
        {
          fontSize: '18px',
          color: '#f1c40f',
          fontStyle: 'bold'
        }
      )

      this.tweens.add({
        targets: perfectText,
        y: perfectText.y - 40,
        alpha: 0,
        duration: 700,
        onComplete: () => perfectText.destroy()
      })
    } else {
      this.score += 1
    }

    this.currentBlock.x = (this.currentBlock.x + lastBlock.x) / 2
    this.currentBlock.blockWidth = overlap

    const body = this.currentBlock.list[0]
    body.width = overlap

    this.blocks.push(this.currentBlock)

    this.craneLine.destroy()

    this.scoreText.setText(`Score: ${this.score}`)

    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('cityblocks-highscore', this.highScore)
      this.highScoreText.setText(`High Score: ${this.highScore}`)
    }

    this.speed += 0.08

    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.cameras.main.scrollY - 52,
      duration: 200
    })

    this.spawnBlock()
  }

  endGame() {
    this.gameEnded = true

    this.add.rectangle(200, 350, 260, 140, 0x000000, 0.65)
      .setScrollFactor(0)

    this.add.text(90, 310, 'GAME OVER', {
      fontSize: '38px',
      color: '#ff7675',
      fontStyle: 'bold'
    }).setScrollFactor(0)

    this.add.text(92, 370, 'Tap to Restart', {
      fontSize: '22px',
      color: '#ffffff'
    }).setScrollFactor(0)
  }

  update() {
    if (!this.currentBlock || this.isDropping || this.gameEnded) return

    this.currentBlock.x += this.speed * this.direction

    this.craneLine.setTo(
      this.currentBlock.x,
      this.currentBlock.y - 260,
      this.currentBlock.x,
      this.currentBlock.y
    )

    if (this.currentBlock.x > 330) {
      this.direction = -1
    }

    if (this.currentBlock.x < 70) {
      this.direction = 1
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 700,
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

new Phaser.Game(config)
