# Очистите предыдущие сборки
dotnet clean

# Восстановите зависимости
dotnet restore

# Соберите проект
dotnet build

# Если нужно для конкретной платформы:
dotnet publish -r win-x64 -c Release