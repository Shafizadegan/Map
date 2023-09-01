import time
from django.http import StreamingHttpResponse
from .models import Coordinate

def sse_stream(request):
    def event_stream():
        while True:
            coordinates = Coordinate.objects.all()
            for coordinate in coordinates:
                data = f"data: {coordinate.origin_lng},{coordinate.origin_lat},{coordinate.destination_lng},{coordinate.destination_lat}\n\n"
                print(data)
                yield data
            time.sleep(120)

    response = StreamingHttpResponse(event_stream(), content_type='text/event_stream')
    response['Cache-Control'] = 'no-cache'
    # response['Connection'] = 'keep-alive'
    del response['Connection']
    return response