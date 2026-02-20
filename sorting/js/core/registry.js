// 전역 레지스트리: 알고리즘을 등록/조회
window.SortRegistry = (() => {
  const map = new Map(); // id -> {id, name, type, run}

  function register(def){
    map.set(def.id, def);
  }
  function get(id){
    return map.get(id);
  }
  function list(){
    return [...map.values()];
  }
  return { register, get, list };
})();
