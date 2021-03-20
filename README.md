## korean-dictionary-elastic-search

Download the [Korean Dictionary](https://krdict.korean.go.kr) into readable file formats.

### install

```sh
yarn
```

### build

```sh
yarn build
```

### Write as CSV File

- In your [OpenAPI](https://krdict.korean.go.kr/openApi/openApiInfo) account, go to the 사전 내려받기 tab and click `XML 전체 내려받기`
- Pass the resulting file as the --input param

You will need to provide your api_key from [OpenAPI](https://krdict.korean.go.kr/openApi/openApiInfo) account

```sh
node dist/main csv --api_key=ZA43CB00B0F745D14Z2B12D4CB4DDA2Y --input=xml.zip --output=output.csv
```

### Write to SQLLite file

- Use the resulting output.csv file from `node dist/main csv` as the input parameter

```sh
node dist/main sqllite --input output.csv --output sqllite.db
```

### Install and run with Docker

```sh
docker build --rm -t korean-dictionary-importer .
docker run --rm -it korean-dictionary-importer node dist/main csv --api_key=ZA43CB00B0F745D14Z2B12D4CB4DDA2Y --input=xml.zip --output=output.csv
```
