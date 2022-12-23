function getRandomColor() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * Converts a date to the browser locale string
 *
 * @param {Number or String} timestamp
 * @returns
 */
function toDateString(timestamp) {
  const dateFormat = new Intl.DateTimeFormat(navigator.language).format
  return dateFormat(new Date(timestamp))
}

/**
 * Generates an Array containing a sequence of integers
 *
 * @param {Number} length Array length
 * @param {Number} initialValue Initial value
 * @returns
 */
function generateSequenceArray(length, initialValue = 0) {
  return Array.from({ length }, (_, i) => i + initialValue)
}

/**
 * Add leading zeroes to a number
 * @param {*} n the number
 * @param {*} width final length
 * @returns zero-padded number
 */
function addZeroPadding(n, width) {
  return String(n).padStart(width, '0')
}

module.exports = {
  getRandomColor,
  toDateString,
  generateSequenceArray,
  addZeroPadding,
}
