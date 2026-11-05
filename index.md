---
layout: default
---

Simon Jeffrey is a senior software engineer at Amazon, where he leads bot and fraud prevention for a high-traffic, customer-facing platform. Before that he worked on Amazon's identity infrastructure, and earlier on data center infrastructure in Japan and across Asia-Pacific.

Before Amazon, he spent twelve years keeping communications and control systems running on offshore oil and gas platforms in the North Sea and abroad. He has also been a flying instructor in the south of France, taking students from ab-initio to a full private pilot's licence (PPL).

He holds a BSc in Computing and IT from The Open University and an HND in Telecommunications Engineering from the University of Hull.

## Writing

{% if site.posts.size > 0 %}
{% for post in site.posts %}
- [{{ post.title }}]({{ post.url | relative_url }}) <span class="meta">({{ post.date | date: "%Y" }})</span>
{% endfor %}
{% else %}
<p class="meta">Nothing here yet.</p>
{% endif %}

## Projects

{% for p in site.data.projects %}
- [{{ p.name }}]({{ p.url }}){% if p.note %} <span class="meta">({{ p.note }})</span>{% endif %}
{% endfor %}

## Open source

{% for p in site.data.opensource %}
- [{{ p.name }}]({{ p.url }}) <span class="meta">({{ p.note }})</span>
{% endfor %}

## Work featured publicly

{% for p in site.data.featured %}
- [{{ p.name }}]({{ p.url }}) <span class="meta">({{ p.note }})</span>
{% endfor %}

## Reading

{% for b in site.data.reading %}
- *{{ b.title }}* by {{ b.author }} <span class="meta">({{ b.year }})</span>
{% endfor %}

## Elsewhere

- [LinkedIn](https://www.linkedin.com/in/sijeffrey)
- [GitHub](https://github.com/sijeffrey)
