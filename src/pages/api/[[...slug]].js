import packageJson from '../../../package.json'
import nc from 'next-connect'
import manageRouter from '../../../app/manage'

let handler = nc({ attachParams: true })

handler.get('api/', (req, res) => {
  res.status(200).json({ version: packageJson.version })
})

manageRouter(handler)

export default handler
