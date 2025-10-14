import httpx
import smtplib
from ..config import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings 
# import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings 

def send_email(username, user_email, linha, tempo_chegada):
  # Usa MIMEMultipart
  msg = MIMEMultipart("alternative")
  msg['Subject'] = 'Notificação sobre o seu ônibus'
  msg['From'] = settings.sender_email
  msg['To'] = user_email

  # Corpo do e-mail em HTML
  corpo_email_html = f"""
  <html>
    <body>
      <h3>Avisa AÍ!</h3>
      <p>Olá, {username}</p>
      <p>O ônibus da <b>linha {linha}</b> está a aproximadamente <b>{tempo_chegada:.0f} minutos</b> de chegar ao seu ponto.</p>
      <p>Prepare-se para sair!</p>
    </body>
  </html>
  """

  # Anexa o corpo do e-mail como HTML
  msg.attach(MIMEText(corpo_email_html, 'html'))

  # Conexão e envio
  try:
    with smtplib.SMTP(settings.email_server, settings.email_port) as s:
      s.starttls()
      # Login Credenciais
      s.login(settings.sender_email, settings.password_email_google)
      s.sendmail(settings.sender_email, [user_email], msg.as_string())
    print(f"E-mail enviado para {user_email}.")
  except Exception as e:
    print(f"Erro ao enviar e-mail para {user_email}: {e}")


def travel_time(origem, destino, sua_chave_api):

  url=settings.base_url

  headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": sua_chave_api,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters" # Opcional: define quais campos retornar
  }

  payload = {
      "origin": {
          "location": {
              "latLng": {
                  "latitude": origem[0],  
                  "longitude": origem[1]  
              }
          }
      },
      "destination": {
          "location": {
              "latLng": {
                  "latitude": destino[0],
                  "longitude": destino[1]
              }
          }
      },
      "travelMode": "DRIVE"
  }

  try:
    response = httpx.post(url, headers=headers, json=payload, timeout=60.0)
    response.raise_for_status()
    
    dados_da_rota = response.json()
    # Extrai a duração em segundos
    duration = dados_da_rota['routes'][0]['duration']
    # Retorna o tempo de viagem em minutos
    return float(duration.replace('s', '')) / 60
      
  except Exception as exc:
    print(f"Erro ao calcular tempo de viagem: {exc}")
    return None