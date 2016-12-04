---
layout: page
title: "Method"
description: "How we did it"
header-img: "img/home-bg.jpg"
order: 5
---

## 1.- Description
liQen aims to identify and report environmental micro-conflicts around the world mixing machine sensor data and human sensoring. In this case we use data about noise pollution from [smartcitizen](https://smartcitizen.me) sensor network and [crowdsurced perceptions](https://crishernandezmaps.github.io/liqen-medialab/form/) collected by a group of citizens in different cities, as a starting point for this project we used and collected data from London, Madrid and Santiago.

## 2.- Getting data

### 2.1.- Quantitative Noise Pollution
We collected noise pollution data through [smartcitizen api](http://developer.smartcitizen.me/), particularly data from outdoor sensors to compare noise perception in public spaces.

![smartcitizen-api](https://i.imgur.com/PV4YkRD.png)
*source: smart citizen*

Smartcitizen sensors provide data about seven variables from where we choose noise pollution.

### 2.2.- Qualitative Noise Pollution
to collect noise perceptions we created an instrument which reduce slant in terms of urban inhabitants behavoir and infraestructure conditions. These data is collected anonimously, then it is weighted and scored to translate perceptions to decibels.

### 2.3.- Standar
We compare both levels of noise (quantitative and qualitative) against the World Health Orgaization recommendation as acceptable noise for a human (read more [here](http://www.euro.who.int/en/health-topics/environment-and-health/noise/noise)).

## 3.- The human factor

> What we will see are hybrids: rich blends of human and machine curation that handle huge datasets while going far beyond narrow confines. We now have so much – whether it’s books, songs, films or artworks (let alone data) – that we can’t manage it all alone. We need an “algorithmic culture”. Yet we also need something more than ever: human taste. ([source](https://www.theguardian.com/technology/2016/sep/30/age-of-algorithm-human-gatekeeper?CMP=fb_gu)).

## 4.- liQen Platform
We have created a platform that provides a way to visualize data and also is a channel to consume data about perceptions. You can make a simple api call to our dashboard like this:

> https://crishernandezmaps.github.io/liqen-medialab/dashboard/?device=3675


---

This project is lead by [Common Action Forum](http://commonactionforum.net/), an international non-profit foundation established in Madrid, Spain, in 2015 to build independent platforms of cooperation, research, innovation and advisory, empowering global citizens to address socio-political issues and economic inequalities.
