from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Coordinate(models.Model):
    origin_lng = models.FloatField(default=51.338076, validators=[MinValueValidator(-180.00), MaxValueValidator(180.00)])
    origin_lat = models.FloatField(default=35.699756, validators=[MinValueValidator(-90.00), MaxValueValidator(90.00)])
    destination_lng = models.FloatField(default=48.704824, validators=[MinValueValidator(-180.00), MaxValueValidator(180.00)])
    destination_lat = models.FloatField(default=34.801698, validators=[MinValueValidator(-90.00), MaxValueValidator(90.00)])