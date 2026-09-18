export const sendSms = async (
  phone: string,
  message: string,
) => {
  const response = await fetch('/api/sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone,
      message,
    }),
  })

  if (!response.ok) {
    throw new Error('Не удалось отправить SMS')
  }

  return response.json()
}