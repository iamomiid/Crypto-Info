# Crypto Info
This repositories makes a websocket connection to [binance](https://binance.com) and gets fresh candles.
It also can retrieve the latest 500 candles for a specific symbol and candle interval.

## Seeds
On each run, application checks for new items to inserted in the database. Here are some possible seeds:
#### Pairs
You can write your desired symbols in a `csv` file and pass the path over `PAIR_CSV_FILE` environment variable. 

## Notes
- Keep in mind to run the latest migrations so that the database gets the fresh updates
- Binance client runs in unauthorized mode. So rate-limiting should be considered.
- Make sure to create a copy from `.env.sample`, name it `.env.local` and update it with your local env vars.

## Roadmap
- [ ] Support start and end time when retrieving old candles
- [ ] Support limit when retrieving old candles
- [ ] Calculate basic indicators (like RSI, MACD, etc)
- [ ] Broadcast basic indicators over websocket

## Contributing
Contributions, issues and feature requests are welcome. 

## License
Copyright © 2021 Omid Seyfan.