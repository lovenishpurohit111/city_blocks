import Phaser from 'phaser'

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.blocks = []
    this.currentBlock = null
    this.direction = 1
    this.score = 0
    this.speed = 3
    this.gameEnded = false
  }

  create() {
    this.cameras.main.setBackgroundColor('#101820')

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '28px',
      color: '#ffffff'
    }).setScrollFactor(0)

    this.highScore = Number(localStorage.getItem('cityblocks-highscore') || 0)

    this.highScoreText = this.add.text(20, 55, `High Score: ${this.highScore}`, {
      fontSize: '18px',
      color: '#dfe6e9'
    }).setScrollFactor(0)

    const base = this.add.rectangle(200, 580, 180, 40, 0x00b894)
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

  spawnBlock() {
    const lastBlock = this.blocks[this.blocks.length - 1]

    this.currentBlock = this.add.rectangle(
      80,
      lastBlock.y - 50,
      lastBlock.width,
      40,
      Phaser.Display.Color.RandomRGB().color
    )

    this.isDropping = false
  }

  dropBlock() {
    if (this.isDropping || !this.currentBlock || this.gameEnded) return

    this.isDropping = true

    const lastBlock = this.blocks[this.blocks.length - 1]
    const delta = Math.abs(this.currentBlock.x - lastBlock.x)

    if (delta > lastBlock.width / 2) {
      this.endGame()
      return
    }

    const overlap = lastBlock.width - delta

    const missedPartWidth = this.currentBlock.width - overlap

    if (missedPartWidth > 0) {
      const missedX = this.currentBlock.x > lastBlock.x
        ? this.currentBlock.x + overlap / 2
        : this.currentBlock.x - overlap / 2

      const missedPart = this.add.rectangle(
        missedX,
        this.currentBlock.y,
        missedPartWidth,
        40,
        this.currentBlock.fillColor
      )

      this.tweens.add({
        targets: missedPart,
        y: missedPart.y + 600,
        angle: 45,
        duration: 1000,
        onComplete: () => missedPart.destroy()
      })
    }

    const perfectPlacement = delta < 5

    if (perfectPlacement) {
      this.score += 2

      this.add.text(this.currentBlock.x - 30, this.currentBlock.y - 30, 'PERFECT!', {
        fontSize: '20px',
        color: '#ffeaa7'
      })
    } else {
      this.score += 1
    }

    this.currentBlock.width = overlap
    this.currentBlock.x = (this.currentBlock.x + lastBlock.x) / 2

    this.blocks.push(this.currentBlock)

    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('cityblocks-highscore', this.highScore)
      this.highScoreText.setText(`High Score: ${this.highScore}`)
    }

    this.scoreText.setText(`Score: ${this.score}`)

    this.speed += 0.12

    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.cameras.main.scrollY - 50,
      duration: 250
    })

    this.spawnBlock()
  }

  endGame() {
    this.gameEnded = true

    this.add.text(95, this.cameras.main.scrollY + 300, 'GAME OVER', {
      fontSize: '42px',
      color: '#ff7675'
    }).setScrollFactor(0)

    this.add.text(75, this.cameras.main.scrollY + 360, 'Tap to Restart', {
      fontSize: '28px',
      color: '#ffffff'
    }).setScrollFactor(0)
  }

  update() {
    if (!this.currentBlock || this.isDropping || this.gameEnded) return

    this.currentBlock.x += this.speed * this.direction

    if (this.currentBlock.x > 340) {
      this.direction = -1
    }

    if (this.currentBlock.x < 60) {
      this.direction = 1
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 700,
  backgroundColor: '#101820',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

new Phaser.Game(config)
