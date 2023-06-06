import NextHead from 'next/head'

export default function Head() {
  const title = 'Make perfect osu! sliders - SliderStudio'
  const description = 'Create perfect sliders for your osu! beatmaps.'

  return (
    <NextHead>
      <title>{title}</title>
      <meta name="author" content="Little" />
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="osu!,slider,beatmap,beatmapping,mapping,Little,little_2d"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <meta name="og:title" content={title} />
      <meta name="og:url" content="https://slider.little.moe" />
      <meta name="og:description" content={description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@little_2d" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </NextHead>
  )
}
