from typing import Any, Optional
from django.core.management.base import BaseCommand
from data_generation import Coordinate
import random

# class Command(BaseCommand):
#     def handle(self, *args: Any, **options: Any) -> str | None:
#         Coordinate.objects.all().delete()
#         for i in range(100):
#             latitude = random.uniform(-90, 90)
#             longitude = random.uniform(-180, 180)
#             x = Coordinate(lat=latitude, lng=longitude)
#             x.save()
#         self.stdout.write(self.style.SUCCESS('Successfully generated data.'))