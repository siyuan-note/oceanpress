import { Octokit } from 'octokit'

// https://dev.to/bro3886/create-a-folder-and-push-multiple-files-under-a-single-commit-through-github-api-23kc
// 有点复杂，先不写了

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({
  auth: ``,
})

// 接受一个参数 repo ，对该 repo 写文件
async function uploadFiles(FILE_PATH: string) {
  const OWNER_NAME = ''
  const REPO_NAME = ''
  const {
    data: { sha },
  } = await octokit.request(
    `GET /repos/${OWNER_NAME}/${REPO_NAME}/contents/${FILE_PATH}`,
    {
      owner: OWNER_NAME,
      repo: REPO_NAME,
      file_path: FILE_PATH,
    },
  )
  const data = await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER_NAME,
    repo: REPO_NAME,
    path: FILE_PATH,
    message: 'Upload test.md',
    content: Buffer.from('file content').toString('base64'),
    sha: sha,
  })
  console.log(data)
}

// 调用函数并传入文件名数组
uploadFiles('test.md')
