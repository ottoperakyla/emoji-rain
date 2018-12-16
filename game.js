import Scoring from "./scoring";
const scoring = new Scoring()
const sounds = {
  powerUp: document.querySelector('#power-up'),
  powerDown: document.querySelector('#power-down'),
  jump: document.querySelector('#jump')
}
let gameRunning = true
let score = 0
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const width = 500
const height = 400
const playerSize = 50
const player = {
  x: width / 2 - playerSize / 2,
  y: height - playerSize,
  width: playerSize,
  height: playerSize,
  speed: 3,
  vx: 0,
  vy: 0,
  jumping: false
}
const enemy = {
  x: width - playerSize,
  y: height - playerSize,
  vx: 0
}
const random = (from, to) => Math.floor(Math.random() * to) + from 
const randomPick = xs => xs[Math.floor(Math.random() * xs.length)]
const friction = 0.8
const gravity = 0.3
const keys = []
const foods = [['🍌',10],['🍌',10],['🍒',20],['🍒',20],['🍆',30],['🍆',30],['🥥',40],['🥑',50], ['☠️',-150]]
const Food = (x, y, icon, score) => ({
  x,
  y,
  vx: random(-2, 3),
  vy: random(2, 3),
  icon,
  width: playerSize / 2,
  height: playerSize / 2,
  score
})
const clamp = (min, max, val) => Math.max(min, Math.min(max, val))
const collectibles = []
for (let i = 0; i < foods.length; i++) {
  const [icon, score] = foods[i]
  collectibles.push(Food(random(0, width), 0, icon, score))
}
scoring.render()

canvas.width = width
canvas.height = height

const render = () => {
  if (!gameRunning) {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'hotpink'
    ctx.font = '80px Helvetica'
    ctx.fillText('Game over', 60, 120)
    const topScores = scoring.get()
    const newTopScore = topScores[0] && score > topScores[0].score
    if (newTopScore) {
      ctx.font = '40px Helvetica'
      ctx.fillText('New top score! 😎', 60, 200)
    }
    if (score > 0) scoring.set([{score, timestamp: new Date()}])
    return
  }
  if (keys['w']) {
    if (!player.jumping) {
      sounds.jump.play()
      player.jumping = true
      player.vy = -player.speed * 2
    }
  }
  if (keys['d']) {
    if (player.vx < player.speed) {
      player.vx++
    }
  }
  if (keys['a']) {
    if (player.vx > -player.speed) {
      player.vx--
    }
  }

  player.vx *= friction
  player.vy += gravity

  player.x += player.vx
  player.y += player.vy

  enemy.vx--
  enemy.vx *= friction
  enemy.x += enemy.vx

  if (enemy.x < -playerSize * 2) {
    enemy.x = width + random(100, 1000)
  }

  if (enemy.x < player.x && enemy.x > player.x - player.width &&
      player.y > enemy.y - player.height + 20) {
    sounds.powerDown.play()
    gameRunning = false
  }

  player.x = clamp(0, width - player.width, player.x)

  if (player.y >= height - player.height) {
    player.y = height - player.height
    player.jumping = false
  }
  
  ctx.clearRect(0, 0, width, height)
  
  for (let i = 0; i < collectibles.length; i++) {
    const collectible = collectibles[i]
    const {x, y, vx, vy, icon: cIcon, width: cWidth, score: cScore} = collectible
    ctx.font = `${cWidth}px Helvetica`
    ctx.fillText(cIcon, x, y)
    collectible.x += vx
    collectible.y += vy

    if (collectible.y > height + cWidth * 4) {
      collectible.y = 0
      collectible.vx = random(-2, 3)
      collectible.vy = random(2, 3)
    }

    if (collectible.x < 0 || collectible.x > width + cWidth) {
      collectible.vx = -vx
    } 

    if (collectible.x > player.x && collectible.x < player.x + playerSize &&
        collectible.y > player.y && collectible.y < player.y + playerSize) {
      collectibles.splice(i, 1)
      cIcon === '☠️'
        ? sounds.powerDown.play()
        : sounds.powerUp.play()
      score += cScore
      const [icon, iconScore] = randomPick(foods)
      collectibles.push(Food(random(0, width), 0, icon, iconScore))
    }
  }

  ctx.fillStyle = 'black'
  ctx.font = `${playerSize}px Helvetica`
  ctx.fillText('💩', player.x, player.y + playerSize)
  ctx.fillText('🛒', enemy.x, enemy.y + playerSize)
  if (score < 0) ctx.fillStyle = 'red'
  ctx.fillText(score.toString(), 0, playerSize)
  requestAnimationFrame(render)
}

window.addEventListener('load', render)
document.addEventListener('keydown', ({key}) => keys[key] = true)
document.addEventListener('keyup', ({key}) => keys[key] = false)
