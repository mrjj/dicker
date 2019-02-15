package main
import (
    gonode "github.com/jgranstrom/gonodepkg"
    json "github.com/jgranstrom/go-simplejson"
    reference "github.com/docker/distribution/reference"
)

func main() {
    gonode.Start(process)
}

func process(cmd *json.Json) (response *json.Json) {
	  response, m, error := json.MakeMap()
    ref_name, _ := reference.ParseNormalizedNamed(cmd.Get("ref").MustString())
    m["error"] = error
    if error == nil {
		  m["ref"] = ref_name.String()
    } else {
      panic(1)
    }
    return
}
