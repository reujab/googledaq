# GoogleDAQ
An idle game where you trade stocks in Google Trends

## Introduction

GoogleDAQ is a game about trading stocks in Google Trends. Your goal is to buy stocks in a search term and sell those stocks when their price peaks. The more Google searches for that search term there are, the higher the price of the stock will be. For example, you could buy stocks in "super bowl" in late January of 2020, and sell them on February 2, 2020, when the stock will peak due to people googling that term.

The price of stocks reset at the beginning of every day, unlike the actual stock market, so to prevent you from simply buying any stock at the beginning of a day and selling it at the end of the day for a guaranteed profit, the current day will only be factored in if the stock price is higher than the previous day. Keep in mind that Google Trends uses the UTC time zone (displayed at the top of the game), so the day starts at 12:00am UTC.

You only start off with $100, so you won't be able to buy any of the big stocks, so start with something small. Maybe it's a weekend and you want to invest in something that you think people will be more likely to search on a weekday.

## Screenshots (click to enlarge)

<table>
	<tr>
		<td>
			<img src="https://raw.githubusercontent.com/reujab/googledaq/master/screenshots/new%20zealand.png">
		</td>
		<td>
			<img src="https://raw.githubusercontent.com/reujab/googledaq/master/screenshots/bing.png">
		</td>
	</tr>
	<tr>
		<td>
			The searches for "new zealand" peaked on March 15 due to the attack.
		</td>
		<td>
			The searches for "bing" peaked on April 1 as <a href="https://www.reddit.com/r/google/comments/b8bfqm/users_boosting_search_for_bing_on_april_fools_day/">an April Fools' joke</a>.
		</td>
	</tr>
	<tr>
		<td>
			<img src="https://raw.githubusercontent.com/reujab/googledaq/master/screenshots/borderlands.png">
		</td>
		<td>
			<img src="https://raw.githubusercontent.com/reujab/googledaq/master/screenshots/april%20fools.png">
		</td>
	</tr>
	<tr>
		<td>
			The searches for "borderlands 3" spiked on the announcement and release.
		</td>
		<td>
			The searches for "april fools" peaked on April 1.
		</td>
	</tr>
</table>

## Downloading

There are [releases](https://github.com/reujab/googledaq/releases) for Linux, macOS, and Windows.

## Compiling from source

```sh
git clone https://github.com/reujab/googledaq
cd googledaq
npm install
npm run pack
./packages/*.AppImage # or .\packages\*.exe
```

## Project structure

* [http/](http)
	* [Graph/](http/Graph)
		* [index.tsx](http/Graph/index.tsx)
			* chart.js wrapper component
	* [Header/](http/Header)
		* [History/](http/Header/History)
			* [index.sass](http/Header/History/index.sass)
				* styles for history component
			* [index.tsx](http/Header/History/index.tsx)
				* history component
		* [index.sass](http/Header/index.sass)
			* styles for header
		* [index.tsx](http/Header/index.tsx)
			* header component
	* [Introduction/](http/Introduction)
		* [index.sass](http/Introduction/index.sass)
			* styles for introduction
		* [index.tsx](http/Introduction/index.tsx)
			* introduction component
	* [Open Sans/](http/Open%20Sans)
		* contains Open Sans font files
	* [Search/](http/Search)
		* [index.tsx](http/Search/index.tsx)
			* search and buy component
	* [Stock/](http/Stock)
		* [index.sass](http/Stock/index.sass)
			* styles for stock component
		* [index.tsx](http/Stock/index.tsx)
			* stock component
	* [Utils/](http/Utils)
		* [index.tsx](http/Utils/index.tsx)
			* renders money and percentages
	* [index.html](http/index.html)
		* entry html document
	* [index.sass](http/index.sass)
		* styles for root elements
	* [index.tsx](http/index.tsx)
		* root component
	* [trends.ts](http/trends.ts)
		* calculates stock price for search queries
* [screenshots/](screenshots)
	* contains screenshots for readme
* [googledaq.ico](googledaq.ico)
	* icon for Windows .exe files
* [googledaq.png](googledaq.png)
	* icon for header and linux .desktop files
* [main.js](main.js)
	* electron file
* [unlicense](unlicense)
	* public domain license
