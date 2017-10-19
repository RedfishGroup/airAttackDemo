import Model from '../node_modules/coreas/src/Model.js'
import util from '../node_modules/coreas/src/util.js'
import RGBDataSet from '../node_modules/coreas/src/RGBDataSet.js'
import FirebaseInterface from '../node_modules/asxtras/src/FirebaseInterface.js'
import Animator from '../node_modules/asxtras/src/Animator.js'
import Color from '../node_modules/asxtras/src/Color.js'

//import {ColorMap, Model, util, RGBDataSet} from '../../node_modules/asx/dist/AS.module.js'

util.toWindow({Model, util })


class AirAttackers extends Model {

  setup () {
    this.anim = new Animator(this)
    this.fbinterface = new FirebaseInterface(this, {databaseURL:'https://anyhazard.firebaseio.com', scenarioID:'st_wineCountry2_2313'})
    this.centerY = 38.298655
    this.centerX = -122.38221
    this.speedMultiplier = 1.0
    this.maxZ = 10;
    this.launchPlanes()
  }

  launchPlanes () {
    // SEATS
    let n = 0
    this.turtles.create(10, (t) => {
      t.r = 0.2
      t.x = this.centerX //Math.random() * 400 - 200
      t.y = this.centerY //Math.random() * 400 - 200
      t.z = 3 + 2 * n + this.maxZ
      t.size = 5
      t.color = Color.toColor('green')
      t.airAttack = false
      t.speed = 0.00005
      n = n + 1
    })
    // Air attack
    this.turtles.create(1, (t) => {
      t.r = 0.1
      t.x = this.centerX // t.r
      t.y = this.centerY // 0
      t.z = 3 + 2 * n + this.maxZ
      t.size = 10
      t.color = Color.toColor('red')
      t.airAttack = true
      t.speed = 0.00007
    })
  }

  step () {
    this.turtles.ask((t) => {
      // This points the plane towards the path on the correct radius, in which the plane should be flying.
      const [tx, ty] = [t.x - this.centerX, t.y - this.centerY]
      const p1mag = Math.hypot(tx, ty)
      const [p2x, p2y] = [t.r * tx / p1mag, t.r * ty / p1mag]
      let [d1x, d1y] = [-p2y / t.r, p2x / t.r] // counter clock wise (ccw)
      if (t.airAttack === true) {
        [d1x, d1y] = [p2y / t.r, -p2x / t.r] // (cw)
      }
      // point towards roughly the next place on the circle
      const [qx, qy] = [p2x + d1x * t.r/2, p2y + d1y * t.r/2]
      if (!(isNaN(qx) && isNaN(qy))) {
        t.faceXY(qx + this.centerX, qy + this.centerY)
      }
      t.forward(t.speed * this.speedMultiplier)
    })
  }
}

//const options = Model.defaultWorld(1, 80)
const model = new AirAttackers({minX:-180, maxX:-120, minY:0, maxY:90})
model.setup()
model.anim.start()

const {world, patches, turtles} = model
util.toWindow({ world, patches, turtles, model })
