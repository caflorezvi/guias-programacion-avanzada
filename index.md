---
inicio: true
---

<div class="portada">
  <p class="portada-curso">Ingeniería de Sistemas y Computación · Universidad del Quindío</p>
  <h1>Programación Avanzada</h1>
  <p class="portada-resumen">Desarrollo de aplicaciones empresariales con Spring Boot y Angular.</p>
</div>

En este espacio académico estudiaremos todos los aspectos relacionados con la creación de aplicaciones empresariales. Por tal motivo, emplearemos el lenguaje de programación Java junto al framework Spring Boot en la parte del backend, dado que este framework dispone de una amplia gama de herramientas que facilitarán la programación de nuestras aplicaciones de manera estructurada y eficiente. Asimismo, en el frontend haremos uso del framework Angular, sumado a otras herramientas de relevancia en la industria que resultan esenciales para nuestro desarrollo profesional.

{% assign proyecto = site.pages | where: "path", "00.proyecto-final.md" | first %}
<section class="bloque">
  <h2>Proyecto final</h2>
  <a class="tarjeta tarjeta-proyecto" href="{{ proyecto.url | relative_url }}">
    <span class="tarjeta-numero">PF</span>
    <span class="tarjeta-titulo">Gestión de alojamientos</span>
    <span class="tarjeta-detalle">Alojamientos, reservas y comentarios con Spring Boot y Angular, desarrollado a lo largo del semestre</span>
  </a>
</section>

{% assign bloques = site.data.guias | group_by: "bloque" %}
{% for bloque in bloques %}
<section class="bloque">
  <h2>{{ bloque.name }}</h2>
  <div class="tarjetas">
  {% for g in bloque.items %}
    {% assign p = site.pages | where: "path", g.archivo | first %}
    <a class="tarjeta" href="{{ p.url | relative_url }}">
      <span class="tarjeta-numero">{{ g.archivo | slice: 0, 2 }}</span>
      <span class="tarjeta-titulo">{{ g.titulo }}</span>
    </a>
  {% endfor %}
  </div>
</section>
{% endfor %}
