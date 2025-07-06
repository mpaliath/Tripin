az cosmosdb create \
  --name tripindocdb \
  --resource-group tripin_group-abf4 \
  --kind GlobalDocumentDB \
  --locations regionName=centralus failoverPriority=0 \
  --default-consistency-level Session \
  --enable-free-tier true

