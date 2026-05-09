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
    this.stars = []
    this.towerTilt = 0
    this.releaseMomentum = 0
    this.windForce = 0
    this.balanceDrift = 0
    this.skyline = []
  }

  create() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    this.cameras.main.setBackgroundColor('#b8c4e8')

    this.highScore = Number(localStorage.getItem('cityblocks-highscore') || 0)

    for (let i = 0; i < 20; i++) {
      const h = Phaser.Math.Between(180, 620)

      const building = this.add.rectangle(
        i * 22,
        760 - h / 2,
        Phaser.Math.Between(20, 55),
        h,
        0x7f8db5,
        0.15
      )

      this.skyline.push(building)
    }

    for (let i = 0; i < 5; i++) {
      const cloud = this.add.ellipse(
        Phaser.Math.Between(0, 400),
        Phaser.Math.Between(60, 220),
        Phaser.Math.Between(70, 120),
        35,
        0xffffff,
        0.75
      )

      cloud.speed = Phaser.Math.FloatBetween(0.1, 0.3)
      this.clouds.push(cloud)
    }

    this.craneTower = this.add.rectangle(200, 55, 10, 120, 0x4a4a4a)
    this.craneBeam = this.add.rectangle(200, 115, 170, 8, 0x4a4a4a)
    this.craneCab = this.add.rectangle(145, 105, 22, 16, 0xd63031)

    this.scoreText = this.add.text(18, 14, '0', {
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setScrollFactor(0)

    const base = this.createBlock(200, 640, 170)
    this.blocks.push(base)

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    this.input.on('pointerdown', () => {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      if (this.gameEnded) {
        this.scene.restart()
      } else {
        this.dropBlock()
      }
    })

    this.spawnBlock()
  }

  playTone(freq, duration, type = 'square', volume = 0.03) {
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = type
    osc.frequency.value = freq

    gain.gain.value = volume

    osc.connect(gain)
    gain.connect(this.audioContext.destination)

    osc.start()

    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration)

    osc.stop(this.audioContext.currentTime + duration)
  }

  createBlock(x, y, width) {
    const container = this.add.container(x, y)

    const shadow = this.add.rectangle(4, 6, width, 52, 0x000000, 0.18)
    const outer = this.add.rectangle(0, 0, width, 48, 0xb9771f)
    const top = this.add.rectangle(0, -12, width - 4, 12, 0xe0a13d)
    const body = this.add.rectangle(0, 6, width - 6, 28, 0xd48d2d)

    outer.setStrokeStyle(4, 0x6e4a12)

    container.add(shadow)
    container.add(outer)
    container.add(body)
    container.add(top)

    const cols = Math.max(2, Math.floor(width / 34))

    for (let i = 0; i < cols; i++) {
      const wx = -width / 2 + 20 + i * 30

      const frame = this.add.rectangle(wx, 5, 18, 22, 0x2f3640)
      const glow = this.add.rectangle(wx, 5, 12, 16, 0x74b9ff)

      container.add(frame)
      container.add(glow)
    }

    container.blockWidth = width

    return container
  }

  spawnBlock() {
    const last = this.blocks[this.blocks.length - 1]

    this.currentBlock = this.createBlock(200, last.y - 56, last.blockWidth)

    this.craneHook = this.add.circle(this.currentBlock.x, this.currentBlock.y - 54, 7, 0x2d3436)

    this.craneLine = this.add.line(
      0,
      0,
      200,
      115,
      this.currentBlock.x,
      this.currentBlock.y - 42,
      0x2d3436
    ).setLineWidth(3)
  }

  applyTowerPhysics() {
    this.balanceDrift *= 0.94
    this.towerTilt += this.balanceDrift
    this.towerTilt *= 0.985

    for (let i = 1; i < this.blocks.length; i++) {
      const strength = i / this.blocks.length
      this.blocks[i].rotation = this.towerTilt * strength
    }
  }

  dropBlock() {
    if (!this.currentBlock || this.gameEnded) return

    this.playTone(420, 0.05, 'triangle', 0.03)

    this.releaseMomentum = Math.cos(this.swingAngle) * 8

    const last = this.blocks[this.blocks.length - 1]

    const adjustedX = this.currentBlock.x + this.releaseMomentum + this.windForce

    const delta = Math.abs(adjustedX - last.x)

    if (delta > last.blockWidth / 2 || Math.abs(this.towerTilt) > 0.42) {
      this.endGame()
      return
    }

    const overlap = last.blockWidth - delta

    this.balanceDrift += (adjustedX - last.x) * 0.0009

    this.currentBlock.blockWidth = overlap
    this.currentBlock.x = Phaser.Math.Linear(adjustedX, last.x, 0.5)

    this.blocks.push(this.currentBlock)

    this.score += 1
    this.scoreText.setText(this.score)

    this.craneLine.destroy()
    this.craneHook.destroy()

    this.tweens.add({
      targets: this.cameras.main,
      scrollY: this.cameras.main.scrollY - 56,
      duration: 200
    })

    this.spawnBlock()
  }

  endGame() {
    this.gameEnded = true

    this.playTone(140, 0.4, 'sawtooth', 0.06)

    this.add.rectangle(200, 320, 260, 120, 0x000000, 0.7)

    this.add.text(85, 300, 'GAME OVER', {
      fontSize: '32px',
      color: '#ff6b6b',
      fontStyle: 'bold'
    })
  }

  update() {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed

      if (cloud.x > 470) {
        cloud.x = -80
      }
    }

    this.applyTowerPhysics()

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

    const sway = Math.sin(this.swingAngle) * 110

    this.currentBlock.x = 200 + sway
    this.currentBlock.rotation = Math.sin(this.swingAngle) * 0.22

    this.craneHook.x = this.currentBlock.x
    this.craneHook.y = this.currentBlock.y - 42

    this.craneLine.setTo(200,115,this.currentBlock.x,this.currentBlock.y - 42)
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