import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("in handler")

  const message = "this is a test"

  res.send({
    message
  })
}

export default handler
