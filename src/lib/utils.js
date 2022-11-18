export function getRandomColor() {
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
export function toDateString(timestamp) {
  const dateFormat = new Intl.DateTimeFormat(navigator.language).format
  return dateFormat(new Date(timestamp))
}
