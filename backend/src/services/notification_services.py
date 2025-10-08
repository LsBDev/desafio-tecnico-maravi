import httpx
import smtplib
import email.message
from ..config import settings



def travel_time(origem, destino, api_key):
  base_url = settings.base_url
  params = {
    "origin": f"{origem[0]},{origem[1]}",
    "destination": f"{destino[0]},{destino[1]}",
    "mode": "transit",  # de onibus
    "key": api_key,
  }
  try:
    response = httpx.get(base_url, params=params, timeout=10.0)
    response.raise_for_status()
    data = response.json()
    
    if data['status'] == 'OK' and data['routes']:
      # Pega o tempo de viagem em segundos
      travel_time_in_seconds = data['routes'][0]['legs'][0]['duration']['value']
      return travel_time_in_seconds / 60
    return None # Retorna None se não encontrar uma rota
  except httpx.HTTPError as e:
    print(f"Erro na requisição HTTP: {e}")
    return None
  except Exception as e:
    print(f"Erro ao processar a resposta da API: {e}")
    return None


def send_email(username, user_email, linha, tempo_chegada):
  corpo_email = """
  <html>
    <body>
      <h3>Avisa AÍ!</h3>
      <p>Olá, {username}</p>
      <p>O ônibus da <b>linha {linha}</b> está a aproximadamente <b>{tempo_chegada:.2f} minutos</b> de chegar ao seu ponto.</p>
      <p>Prepare-se para sair!</p>
    </body>
  </html>
  """
  msg= email.message.Message()
  msg['Subject'] = 'Assunto'
  msg['From'] = 'Remetente'
  msg['To'] = 'Destinatário'
  password = 'Senha'
  msg.add_header('Content-type', 'text/html')
  msg.set_payload(corpo_email)

  s = smtplib.SMTP('smtp.gmail.com: 587')
  s.starttls()
  # Login Credenciais
  s.login(msg['From'], password)
  s.sendmail(msg['From'], [msg['To']], msg.as_string().encode('utf-8')) 

  print(f"E-mail enviado para {user_email}: Ônibus da linha {linha} está a {tempo_chegada:.2f} minutos do seu ponto.")