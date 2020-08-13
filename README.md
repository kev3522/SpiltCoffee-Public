# ☕️ spilt coffee
[>> spilt-coffee.web.app <<](https://spilt-coffee.web.app/)  
**Media monitoring and brand reputation trends powered by AI.**   
We help small businesses take control of their brand by giving them instant access to and sentiment analysis on mentions across social, reviews, news and and more.

![alt text](https://i.imgur.com/6k18HXN.jpg)

## ✨ Mission
We believe everyone has room to grow and thrive. We commoditize big data for small businesses, reviews are better when they’re heard. No one should be left out because the cost is too great or the technology too complex. So we build easy tools to empower businesses to take control of their brand. Tools that make media monitoring, competitive analysis and reputation tracking effortless—spill the coffee. 

## 📈 Features
**SEARCH**   
We scrape data from Yelp, Twitter and News about your brand (and any brand), bucket reviews by sentiment and display results on user-friendly charts.  

**MONITOR**   
We automate searches to easily monitor brand sentiments over time, and display historical trends on this data.  

**SENTIMENT ANALYSIS**  
We utilize advanced sentiment detection tools like VADER and wit.ai to segment positive, negative and neutral mentions, and assign overall sentiment to each mention.  

**COMPETITIVE ANALYSIS**  
We allow businesses to compare and overlay competitor data with their own, keeping up to date with what the *people* are saying. 

## 🧱 Architecture
A brief overview of our application, with some key features (green) on the left and how we handle them on the backend on the right. 
![alt text](https://i.imgur.com/ncurVj9.png)

## 🔮 NLP Model 
**MODEL**  
Sentiment analysis was conducted based on an ensemble model aggregating both the [VADER model](https://github.com/cjhutto/vaderSentiment) and Facebook’s wit.ai NLP model. Train and test data was primarily formed from Yelp’s open data set (>8,000,000 user reviews) and the Sentiment140 Twitter dataset. 

**ACCURACY**  
Running our ensemble model on a subset (test) dataset, we achieved an accuracy 73.35% on a set of 2000 test Yelp points as well as a 74.25% for the Sentiment140 set on their given test set of 497 tweets. 

**NEXT STEPS**  
With spilt coffee, we can eventually provide further detailed analysis per company via reviews and collected text. Analysis on very negative reviews during dips historical trends can provide us with bi- and tri-grams of common phrases used in negative reviews. We can see what users tend to have issues with, and provide actionable recommendations to improve these businesses.  

## 💻 Tech Stack
-   **UI frameworks:** `ElasticUI` `Recharts` 
-   **Frontend:** `React.js`
-   **Backend:** `Django`
-   **DB:** `PostgreSQL`
-   **Authentication:** `Auth0`
-   **Model:** `VADER` `wit.ai`

## ✔️ To Do 
 ☐ Provide helpful feedback and insights for businesses (actionable recommendations!).  
 ☐ Perform more in depth competitor sentiment analysis, and ability to recognize competitors.  
 ☐ Allow users to mark wrong sentiments (and correct them). Our models aren't perfect, we have room to grow too!  
 ☐ We already provide a set of content marked as "extremely negative" or "extremely positive". Now, it's time to extrapolate reasons and analyze severity.   
 ☐ Scrape more platforms (Facebook, Instagram, more news sources, etc.) 

## 👻 Fun Facts
- In our first (virtual) meeting where we were struggling to decide on our product name, one member spilled coffee on himself—with that, "spilt coffee" was born. 
- "8 million rows [of yelp review data] is a lot of rows." 

