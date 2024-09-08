import { render } from 'solid-js/web'
import { newSiyuanRepo, type indexes, type indexesJSON } from './repo.ts'
import { createEffect, createSignal } from 'solid-js'
const getRepo = usePromise(
  newSiyuanRepo({
    dir: import.meta.env.VITE_repo_dir,
    key: import.meta.env.VITE_repo_key,
    userId: import.meta.env.VITE_userID,
  }),
)
const App = () => {
  const [indexes, set_indexes] = createSignal<indexes>()
  const [test, set_test] = createSignal<any>()
  createEffect(() => {
    let repo = getRepo()
    if (!repo) return
    repo.latestIndexes().then((index) => {
      set_indexes(index)
    })
  })
  return (
    <>
      <img src={test()}></img>
      <div>
        <ul>
          <h2>test </h2>
          <h2>indexes ALL</h2>
          {indexes()?.files.map((item) => (
            <li
              onclick={() => {
                getRepo()!
                  .readFile(item)
                  .then((res) => {
                    console.log('[res]', res)
                    if (res.meta.path.endsWith('.sy')) {
                      const decoder = new TextDecoder()
                      console.log(
                        '[decoder.decode(res.file)]',
                        decoder.decode(res.file),
                      )
                    }else if (res.meta.path.endsWith('.png')) {
                        const png = new Blob([res.file])
                        const url = URL.createObjectURL(png)

                        set_test(url)
                    }
                  })
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

render(() => <App />, document.getElementById('app')!)

export function usePromise<T extends Promise<any>>(p: T) {
  const [data, set_data] = createSignal<Awaited<T> | null>(null)
  p.then((data) => {
    console.log('实例化')
    set_data(data)
  })
  return data
}
