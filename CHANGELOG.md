###v. 0.2.1 (28 Feb 2017)
Fixed issue, when data is null [#4](https://github.com/yury-dymov/json-api-normalizer/issues/4)

###v. 0.2.0 (09 Feb 2017)
Format changed for `filterEndpoint` option equals `false` for metadata.

####Was
```JSON
{
  meta: {
    '/test?page=1': {...},
    '/test?page=2': {...},
    '/anotherTest': {...}
  }
}
```

#### Now
```JSON
{
  meta: {
    '/test': {
      '?page=1': {...},
      '?page=2': {...}
    },
    '/anotherTest': {...}
  }
}
```

###v. 0.1.1 (03 Feb 2017)
Added lazy loading support according to [#2](https://github.com/yury-dymov/json-api-normalizer/issues/2)
