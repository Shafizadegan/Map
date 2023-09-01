from django.urls import path
from sse_stream.views import sse_stream

urlpatterns =[
    path('', sse_stream, name='sse_stream'),
]