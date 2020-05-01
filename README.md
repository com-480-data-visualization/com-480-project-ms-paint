# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
|Jonathan Labhard |264267 |
|Deniz Ira | 269728|
|Guillaume Augustoni | 314052|

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)

### Dataset
One of the datasets we will use is the Johns Hopkins CSSE's COVID-19 dataset which can be found <a href="https://github.com/CSSEGISandData/COVID-19">here</a>.
The dataset contains daily data of the new COVID-19 cases by region, starting from 22/01/2020 to the actual date. The data contains the number of new cases, recoveries and deaths per day.

Another dataset we chose to use is the NY Times dataset about the number of daily cases and deaths per county and state in the United States. The dataset can be found <a href="https://github.com/nytimes/covid-19-data/">here</a>.

We will also use the french governments COVID-19 dataset which can be found <a href="https://www.data.gouv.fr/fr/datasets/donnees-des-urgences-hospitalieres-et-de-sos-medecins-relatives-a-lepidemie-de-covid-19/">here</a>. This dataset has more detailed information about the disease. The data is daily and regional infromation about new cases. There are also information about the gender and age of patients as well as different treatment information.

The first two datasets do not require and preprocessing or data-cleaning since they are quite simple, the french governments' dataset contains some, but a daily erratum report is published on their website.

### Problematic
Our project aims to bring more information and visualization about the spread of the COVID-19 virus.

Since most countries have taken strict regulation measures these past few weeks, we hope to observe the impact of those measure on the recovery of the countries and make some comparisons. 

We will first compare the different countries in the world, and then focus on the regions of France and the USA to see how a state-based country copes compared to a more centralized one.

### Exploratory Data Analysis

Pre-processing of the data set you chose:

#### John Hopkins Dataset:
The John Hopkins dataset is updated daily.
In this dataset there is the number of cases, deaths and recoveries for 258 countries, external territories or cruise ships.
It also contains more specific data about the United States for 3254 distinct locations. 
The data is also available in daily csv files which contains different provinces for other countries as well, as well as the last data update date.

#### French Dataset:
Data starts the 2020-02-24, it is available in 3 types departments, region, and for France. We will be focusing on regions of France. 

Available data is the daily number of people hospitalised, sos-medecin actions related to covid-19. Data on the sex of patients is available. 

22423 data-points are stored in a csv format for the regions. 

#### US Dataset:
The dataset on cases in the US contains data on 55 different "states". 

It contains information on the number of deaths and cases due to the virus in all these states. 

It covers data from January 21st to April 4th and is updated daily. 

On average, states have data on about 30 days. Only 4 of them have information on less that 20 days, we consider them as outliers.



### Related work
The evolution of number of hospitalisations and deaths has already been plotted for France : [here](https://datastudio.google.com/u/0/reporting/a62032a5-550a-4a97-bfdc-8ac909f9814b/page/ArPKB)
and regions : 
[here](https://www.lemonde.fr/les-decodeurs/article/2020/04/01/coronavirus-visualisez-le-nombre-de-personnes-hospitalisees-departement-par-departement_6035199_4355770.html). 

Simulations have been done on the effectiveness of different covid-19 policies : [here](https://exchange.iseesystems.com/public/isee/covid-19-simulator/index.html#page1)

We will focus on a smaller case comparing the evolution of covid-19 in different regions of countries. 


## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**

A prototype for part 1 can be found [here](https://observablehq.com/d/8d0f9460efcdc7c5)




## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**

