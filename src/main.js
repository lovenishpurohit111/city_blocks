import Phaser from 'phaser'

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.blocks = []
    this.currentBlock = null
    this.direction = 1
    this.score = 0
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#101820')

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '28px',
      color: '#ffffff'
    })

    const base = this.add.rectangle(200, 580, 180, 40, 0x00b894)
    this.blocks.push(base)

    this.spawnBlock()

    this.input.on('pointerdown', () => {
      this.dropBlock()
    })
  }

  spawnBlock() {
    const lastBlock = this.blocks[this.blocks.length - 1]

    this.currentBlock = this.add.rectangle(
      100,
      lastBlock.y - 50,
      lastBlock.width,
      40,
      0x0984e3
    )

    this.isDropping = false
  }

  dropBlock() {
    if (this.isDropping || !this.currentBlock) return

    this.isDropping = true

    const lastBlock = this.blocks[this.blocks.length - 1]
    const delta = Math.abs(this.currentBlock.x - lastBlock.x)

    if (delta > lastBlock.width / 2) {
      this.add.text(120, 300, 'Game Over', {
        fontSize: '42px',
        color: '#ff7675'
      })

      this.scene.pause()
      return
    }

    const overlap = lastBlock.width - delta

    this.currentBlock.width = overlap
    this.currentBlock.x = (this.currentBlock.x + lastBlock.x) / 2

    this.blocks.push(this.currentBlock)

    this.score += 1
    this.scoreText.setText(`Score: ${this.score}`)

    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.cameras.main.scrollY - 50,
      duration: 200
    })

    this.spawnBlock()
  }

  update() {
    if (!this.currentBlock || this.isDropping) return

    this.currentBlock.x += 3 * this.direction

    if (this.currentBlock.x > 320) {
      this.direction = -1
    }

    if (this.currentBlock.x < 80) {
      this.direction = 1
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 700,
  scene: GameScene
}

new Phaser.Game(config)
