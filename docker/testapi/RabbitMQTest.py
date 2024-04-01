import pandas as pd
import pika

def test():
    date = pd.date_range('1/1/2018', freq = 'D', periods = 31)
    x = np.arange(31)
    y = np.arange(31, 62)
    df = pd.DataFrame(date, columns=['Date'])
    df['x'] = x
    df['y'] = y
    return df.to_parquet('test.parquet')

if __name__ == "__main__":
    # Connects Test to RabbitMQ
    while True:
        try:
            credentials = pika.PlainCredentials("guest", "guest")
            connection = pika.BlockingConnection(
                pika.ConnectionParameters("rabbitmq", 5672, "/", credentials, heartbeat = 5000)
            )
            channel = connection.channel()
            break
        except Exception as e:
            print("Test waiting for connection")
            time.sleep(5)

    # Runs the API calls forever
    while True:
        test_parquet = test()

        # Sends parquet to Frontend
        channel.queue_declare(queue='TestQ')
        channel.basic_publish(exchange="", routing_key="TestQ", body=test_parquet)
        print("[Test -> Frontend] Sent test_parquet")

        time.sleep(300)
        
    connection.close()
