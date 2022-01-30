FROM python:3.9.10

WORKDIR /src

COPY src .

EXPOSE 3000

CMD ["python3", "-m", "http.server", "3000"]
