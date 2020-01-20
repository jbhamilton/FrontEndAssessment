	Assumptions
assumption: Local storage is supported and enabled. I don't think you're testing basic defensive programming, so my time will be spent elsewhere

assumption: If the returned symbol data does not include the opening and closing price, that symbol will be disregarded.

assumption: It's fine to design for a middle to high resolution display device, given the target (finance) and the context of the assessment.

assumption: You're more interested in displays of rate of learning, front-end design intuition, and effective use of initiative than in my ability to remove/edit structural elements included in the assessment. In other words, I'm not going to spend time removing the home page or its routing when I can instead learn and demonstrate adding a new page and its routing.

assumption: The "Open From" column will go back to being meaningful once the markets open. I got a brief period to play with this late Friday, but the entire development occurred over the weekend, which is less than ideal for working with stock data. One other untested element is the "Status" column. Based on the IEX API documentation, I believe my implementation will keep those values appropriate. 

	Symbols Page
A table was chosen because it fits the norm of the finance applications I've seen and it makes intuitive sense. Table columns were chosen based on what I (with my limited understanding) believed to be the most relevant data points.

One company name (Controladora Vuela Compañía de Aviación SAB de CV) was brutally extending the size of its column, so I set a maximum width to that column's data cells through a class, extending the full name if hovered to ensure users would feel comfortable copy/pasting the name if they had need of it.

The largest sticking point for me was the related to caveat 1 in the first link below. I was unable to instantly update a few components based on their hidden/favorited/default state because I used indexed memory. Finding the resolution method was a little troubling, as the information is not directly under Conditional Rendering. Unfortunately, that wasn't actually the issue.

What was going on is I declared a variable in the tracked data section as an empty object and later added its properties, as below. The added properties were not tracked, due to an entirely separate aspect of Vue's rendering model, described in the second link, which describes the actual problem and solution.

symbolGroups : []
this.symbolgroups[company.symbol] = 'default';
https://vuejs.org/v2/guide/list.html#Array-Change-Detection
https://vuejs.org/v2/guide/reactivity.html

Coloring text in the "Daily Change" column - which depends on element-specific calculations of v-for generated elements - took me longer than it should have. I wanted to try to make an in-line expression satisfy the need, but v:bind would only take a variable or a computed property, and using computed properties on a v-for generated set of entries is either not supported or not commonly talked about. The latter presumption based is upon the large amount of reading I've done on the subject, trying to learn the feature and tick the "things that will distinguish you" box. I tried returning html through a function return, but it didn't play nicely in my table.

I had avoided the getElementByID route because uniquely identifying these generated elements was outside of my understanding, but continued reading found the getElement>s< features. I used getElementsByClass and an on-update hook (delayed until the next tick per the documentation). This wouldn't be an issue if I had simply added another element (the calculated daily change) to each valid symbol data set, and I wouldn't make the same decision again, but it's kept this way for whatever demonstrative value it might have.

It's not well-positioned for its significance, but be sure to press a blue "Details" button on the /symbols page.

	Details page
The Details page is not visible in the menu on the left - this is an intentional choice, as I passed the symbol name in a URL parameter, and I don't want to create a situation where I generate too many searches against your API token, though I'm not sure if you use it for anything else in the first place.

Against the assumption of "don't do pointless things", I did add some elements to the default URL "/detailed". This was done while learning routing navigation and exploring a few features.

Some pricing data from the IEX endpoints utilized on this page are unavailable at times, per "Refers to the official open price from the SIP. 15 minute delayed (can be null after 00:00 ET, before 9:45 and weekends)" - this is the case for opening and closing prices. As a workaround, any time the endpoint is returning null data for these values, I substitude the previous day's closing value for the "open" value and the latest price for the "close" value, since this is very nearly the same as the true result, and the one computed value dependent upon these two is "daily change", which is trying to represent the same trend.

The chart was implemented using vue-chartjs and a Vue component with a prop. The options object was built out in the Chart.vue file itself in a way that screams bad programming practice, but I was doing some extended debugging and needed to eliminate options for what was at fault.