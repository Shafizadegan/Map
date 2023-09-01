from rest_framework import serializers
from data_generation.models import Coordinate

class CoordinateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coordinate
        fields = '__all__'

    def create(self, validated_data):
        new_coordinate = Coordinate.objects.create(**validated_data)
        return new_coordinate
