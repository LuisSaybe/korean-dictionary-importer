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

### Write as line seperated XML

The resulting output file will be a line seperated file where each line contains an XML corresponding to a dictionary entry.

- In your [OpenAPI](https://krdict.korean.go.kr/openApi/openApiInfo) account, go to the 사전 내려받기 tab and click `XML 전체 내려받기`
- Pass the resulting zip file as the --input param
- You will need to provide your api_key from [OpenAPI](https://krdict.korean.go.kr/openApi/openApiInfo) account

```sh
node dist/main xml --api_key=ZA43CB00B0F745D14Z2B12D4CB4DDA2Y --input=xml.zip --output=output.txt
```

### Write to SQLLite file

- Use the resulting output line seperated XML file from `node dist/main xml` as the input parameter

```sh
node dist/main sqllite --input output.txt --output sqllite.db
```

### Install and run with Docker

```sh
docker build --rm -t luissaybe/korean-dictionary-importer .
docker run \
  --rm \
  -it \
  -v $(pwd)/xml.zip:/xml.zip \
  -v $(pwd)/output.txt:/output.txt \
  luissaybe/korean-dictionary-importer \
  node dist/main xml --api_key=ZA43CB00B0F745D14Z2B12D4CB4DDA2Y --input=/xml.zip --output=/output.txt
```
