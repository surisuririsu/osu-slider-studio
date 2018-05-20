/*
Copyright (c) 2007-2018 ppy Pty Ltd <contact@ppy.sh>.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Source: https://github.com/ppy/osu/blob/master/osu.Game/Rulesets/Objects/BezierApproximator.cs
// Ported and modified May 12, 2018 by robertlai

import { SCALE_FACTOR } from '../../utils/constants'

const TOLERANCE = 0.25
const TOLERANCE_SQ = Math.pow(TOLERANCE, 2)

function isFlatEnough(points) {
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    const pp = points[i - 1]
    const np = points[i + 1]
    const x = pp.x - 2 * p.x + np.x
    const y = pp.y - 2 * p.y + np.y
    if (Math.pow(x, 2) + Math.pow(y, 2) > TOLERANCE_SQ * 4) return false
  }
  return true
}

function subdivide(points, left, right) {
  const midpoints = points.slice()
  const count = points.length
  for (let i = 0; i < count; i++) {
    left[i] = midpoints[0]
    right[count - i - 1] = midpoints[count - i - 1]
    for (let j = 0; j < count - i - 1; j++) {
      midpoints[j] = {
        x: (midpoints[j].x + midpoints[j + 1].x) / 2,
        y: (midpoints[j].y + midpoints[j + 1].y) / 2
      }
    }
  }
}

function approximate(points, output) {
  const left = []
  const right = []
  subdivide(points, left, right)

  const count = points.length
  for (let i = 0; i < count - 1; i++) {
    left[count + i] = right[i + 1]
  }
  output.push(points[0])
  for (let i = 1; i < count - 1; i++) {
    const index = 2 * i
    const p = left[index]
    const pp = left[index - 1]
    const np = left[index + 1]

    const xp = 0.25 * (pp.x + 2 * p.x + np.x)
    const yp = 0.25 * (pp.y + 2 * p.y + np.y)
    output.push({ x: xp, y: yp })
  }
}

function getPoints(points) {
  const toFlatten = [points.slice()]
  const output = []
  while (toFlatten.length > 0) {
    parent = toFlatten.pop()
    if (isFlatEnough(parent)) {
      approximate(parent, output)
      continue
    }

    const rChild = []
    const lChild = []
    subdivide(parent, lChild, rChild)
    parent = lChild.slice()

    toFlatten.push(rChild)
    toFlatten.push(parent)
  }

  output.push(points[points.length - 1])
  return output
}

export default class BezierSegment {
  static draw(ctx, points, width) {
    const output = getPoints(points)

    output.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, width * SCALE_FACTOR / 2, 0, 2 * Math.PI, false)
      ctx.fill()
      ctx.closePath()
    })
  }

  static getBezierApproximation(points) {
    return points
  }
}
