###v. 0.4.0 (15 Mar 2017)
Relationshop normalization implementation changed [discussion](https://github.com/yury-dymov/json-api-normalizer/issues/11)

###v. 0.3.0 (09 Mar 2017)
IDs now preserved in entities. [discussion](https://github.com/yury-dymov/json-api-normalizer/issues/3)

###v. 0.2.4 (08 Mar 2017)
Store links for subqueries in meta [#7](https://github.com/yury-dymov/json-api-normalizer/issues/6)

###v. 0.2.3 (06 Mar 2017)
Fixed issue, when data is null for the meta [#5](https://github.com/yury-dymov/json-api-normalizer/pull/5)

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
