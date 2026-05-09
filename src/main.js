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
    this.cameras.main.setBackgroundColor('#87CEEB')

    for (let i = 0; i < 8; i++) {
      const h = Phaser.Math.Between(180, 420)
      this.add.rectangle(
        50 + i * 60,
        700 - h / 2,
        40,
        h,
        0x95a5a6,
        0.25
      )
    }

    this.scoreText = this.add.text(15, 15, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setScrollFactor(0)

    this.infoText = this.add.text(15, 45, 'SPACE / CLICK to drop', {
      fontSize: '14px',
      color: '#ffffff'
    }).setScrollFactor(0)

    this.base = this.createBlock(200, 620, 180)
    this.blocks.push(this.base)

    this.spawnBlock()

    this.cursors = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )

    this.input.on('pointerdown', () => {
      if (this.gameEnded) {
        this.scene.restart()
      } else {
        this.dropBlock()
      }
    })
  }

  createBlock(x, y, width) {
    const container = this.add.container(x, y)

    const body = this.add.rectangle(0, 0, width, 42, 0xe67e22)
    body.setStrokeStyle(3, 0x2d3436)

    container.add(body)

    const windows = Math.max(2, Math.floor(width / 32))

    for (let i = 0; i < windows; i++) {
      const win = this.add.rectangle(
        -width / 2 + 18 + i * 28,
        0,
        14,
        14,
        0x2c3e50
      )

      container.add(win)
    }

    container.blockWidth = width

    return container
  }

  spawnBlock() {
    const lastBlock = this.blocks[this.blocks.length - 1]

    this.currentBlock = this.createBlock(
      80,
      lastBlock.y - 52,
      lastBlock.blockWidth
    )

    this.craneLine = this.add.line(
      0,
      0,
      this.currentBlock.x,
      this.currentBlock.y - 250,
      this.currentBlock.x,
      this.currentBlock.y,
      0x222222
    )

    this.craneLine.setLineWidth(2)

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

    this.currentBlock.x = (this.currentBlock.x + lastBlock.x) / 2
    this.currentBlock.blockWidth = overlap
    this.currentBlock.list[0].width = overlap

    this.blocks.push(this.currentBlock)

    this.score += 1
    this.scoreText.setText(`Score: ${this.score}`)

    this.craneLine.destroy()

    this.cameras.main.shake(80, 0.002)

    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.cameras.main.scrollY - 52,
      duration: 180
    })

    this.speed += 0.12

    this.spawnBlock()
  }

  endGame() {
    this.gameEnded = true

    this.add.rectangle(200, 320, 260, 120, 0x000000, 0.7)
      .setScrollFactor(0)

    this.add.text(82, 295, 'GAME OVER', {
      fontSize: '34px',
      color: '#ff7675',
      fontStyle: 'bold'
    }).setScrollFactor(0)

    this.add.text(70, 340, 'Click to Restart', {
      fontSize: '20px',
      color: '#ffffff'
    }).setScrollFactor(0)
  }

  update() {
    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      !this.gameEnded
    ) {
      this.dropBlock()
    }

    if (!this.currentBlock || this.isDropping || this.gameEnded) return

    this.currentBlock.x += this.speed * this.direction

    this.craneLine.setTo(
      this.currentBlock.x,
      this.currentBlock.y - 250,
      this.currentBlock.x,
      this.currentBlock.y
    )

    if (this.currentBlock.x > 320) {
      this.direction = -1
    }

    if (this.currentBlock.x < 80) {
      this.direction = 1
    }
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
