---
layout: page
title: daily news
permalink: /daily-news/
description: A daily digest of NLP and AI news, new models, tutorials, and the arXiv papers picked for my research.
nav: true
nav_order: 3
---

<div class="daily-news-list">
{% assign posts = site.dailynews | sort: 'date' | reverse %}
{% if posts.size == 0 %}
  <p>Nothing yet. The first digest arrives tomorrow morning.</p>
{% endif %}
{% for post in posts %}
  <a class="dn-card" href="{{ post.url | relative_url }}">
    <div class="dn-card-date">{{ post.date | date: '%A, %d %B %Y' }}</div>
    <div class="dn-card-title">{{ post.title }}</div>
    <p class="dn-card-lede">{{ post.description }}</p>
  </a>
{% endfor %}
</div>
