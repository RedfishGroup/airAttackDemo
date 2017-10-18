import ColorMap from '../node_modules/asx/src/ColorMap.js'
import Model from '../node_modules/asx/src/Model.js'
import util from '../node_modules/asx/src/util.js'
import RGBDataSet from '../node_modules/asx/src/RGBDataSet.js'
import Animator from '../node_modules/asx/src/Animator.js'
import FirebaseInterface from '../node_modules/asxtras/src/FirebaseInterface.js'

//import {ColorMap, Model, util, RGBDataSet} from '../../node_modules/asx/dist/AS.module.js'

util.toWindow({ ColorMap, Model, util })

let elevImgSrc = 'https://node.redfish.com/Documents/elevationServer/tiles/10/194/385.png'

class AirAttackers extends Model {

  constructor (...args) {
    super(...args)
    this.fbinterface = new FirebaseInterface(this, 'test2')
  }

  setup () {
    this.cmap = ColorMap.Jet
    this.refreshPatches = true
    this.centerX = 0
    this.centerY = 0
    const imgtmp = new Image()
    imgtmp.crossOrigin = "Anonymous"
    imgtmp.onload = () => {
      const ds = new RGBDataSet(imgtmp, 0, 3.28 / (10 * 1000)) // meters to 1000s of feet
      this.patches.importDataSet (ds, 'z', false)
      this.refreshElevationColors()
      this.launchPlanes()
    }
    imgtmp.src = elevImgSrc
  }

  refreshElevationColors () {
    this.minZ = model.patches.reduce((a, b) => { if (a < b.z) return a; return b.z })
    this.maxZ = model.patches.reduce((a, b) => { if (a > b.z) return a; return b.z })
    this.patches.ask(p => {
      p.setColor(this.cmap.scaleColor(p.z, this.minZ, this.maxZ))
    })
  }

  launchPlanes () {
    // Air attack
    this.turtles.create(1, (t) => {
      t.r = 50
      t.x = t.r
      t.y = 0
      t.z = 7 + this.maxZ
      t.size = 12
      t.color = 'red'
      t.airAttack = true
      t.speed = 0.7
    })
    // make SEATS
    let n = 0
    this.turtles.create(40, (t) => {
      t.r = 40
      t.x = Math.random() * 400 - 200
      t.y = Math.random() * 400 - 200
      t.z = 3 + 2 * n + this.maxZ
      t.size = 10
      t.color = 'green'
      t.airAttack = false
      t.speed = 0.5
      n = n + 1
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
      t.faceXY(qx + this.centerX, qy + this.centerY)
      t.forward(t.speed)
      t.patch.color = 'blue'
    })
  }
}

const options = Model.defaultWorld(1, 80)
const model = new AirAttackers(document.body, options)
model.setup()
model.start()

const {world, patches, turtles} = model
util.toWindow({ world, patches, turtles, model })
