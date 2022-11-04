import packageJson from '../../package.json'

export default function handler(req, res) {
  res.status(200).json({ version: packageJson.version })
}
