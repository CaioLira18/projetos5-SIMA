"""Serializers do app users — cadastro, perfil e login com payload enriquecido."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.areas_risco.models import Bairro

User = get_user_model()


class BairroResumoSerializer(serializers.ModelSerializer):
    """Recorte do bairro embutido em representações de user/relato."""

    class Meta:
        model = Bairro
        fields = ['id', 'nome', 'slug']


class UserSerializer(serializers.ModelSerializer):
    """Representação do usuário pra retorno (sem dados sensíveis).

    Bairro aparece como objeto aninhado na leitura e como id na escrita —
    o campo write-only ``bairro_id`` evita ambiguidade no PATCH.
    """

    bairro = BairroResumoSerializer(read_only=True)
    bairro_id = serializers.PrimaryKeyRelatedField(
        source='bairro',
        queryset=Bairro.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            'id',
            'nome',
            'email',
            'telefone',
            'bairro',
            'bairro_id',
            'lat',
            'lng',
            'role',
            'date_joined',
        ]
        read_only_fields = ['id', 'role', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Cadastro público — força role=cidadao."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )
    bairro = serializers.PrimaryKeyRelatedField(
        queryset=Bairro.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            'nome',
            'email',
            'telefone',
            'bairro',
            'lat',
            'lng',
            'password',
            'password_confirm',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password_confirm': 'As senhas não conferem.'}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        return User.objects.create_user(password=password, **validated_data)


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer para o admin gerenciar usuários — role é editável."""

    bairro = BairroResumoSerializer(read_only=True)
    bairro_id = serializers.PrimaryKeyRelatedField(
        source='bairro',
        queryset=Bairro.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            'id', 'nome', 'email', 'telefone',
            'bairro', 'bairro_id', 'lat', 'lng',
            'role', 'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']


class LoginSerializer(TokenObtainPairSerializer):
    """Login JWT que devolve os tokens + dados do usuário autenticado.

    Evita uma segunda chamada do frontend logo após o login só pra hidratar o perfil.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['nome'] = user.nome
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
